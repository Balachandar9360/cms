import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  listStudents, listLowBalanceWallets, listLowStockItems,
} from "../../api/adminApi";
import Badge, { StatusBadge } from "../../components/Badge";
import { WalletPill } from "../../components/WalletStub";
import { SkeletonRows } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import { useToast, apiErrorMessage } from "../../context/ToastContext";

// No dedicated admin-stats endpoint exists yet on the backend, so this
// page derives simple counts client-side from the student list. Swap
// this out once GET /api/admin/dashboard/stats (spec section 17) ships.
export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowBalance, setLowBalance] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const toast = useToast();

  const loadAlerts = useCallback(() => {
    setAlertsLoading(true);
    Promise.all([listLowBalanceWallets(), listLowStockItems()])
      .then(([walletsRes, stockRes]) => {
        // Both endpoints return a plain array (no data wrapper)
        const walletsData = Array.isArray(walletsRes.data)
          ? walletsRes.data
          : walletsRes.data?.data || [];
        const stockData = Array.isArray(stockRes.data)
          ? stockRes.data
          : stockRes.data?.data || [];
        setLowBalance(walletsData);
        setLowStock(stockData);
      })
      .catch((err) => toast.error(apiErrorMessage(err, "Could not load alerts")))
      .finally(() => setAlertsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listStudents("", 0, 200)
      .then((res) => setStudents(res.data.data.content || []))
      .catch((err) => toast.error(apiErrorMessage(err, "Could not load students")))
      .finally(() => setLoading(false));
    loadAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const total = students.length;
  const active = students.filter((s) => s.status === "ACTIVE").length;
  const inactive = total - active;
  const recent = students.slice(0, 6);

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Overview</span>
          <h1>Admin Dashboard</h1>
          <p className="desc">Institution-wide snapshot of registered students.</p>
        </div>
        <Link to="/admin/students/new" className="btn btn-brass">+ Register Student</Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="eyebrow">Total Students</span>
          <div className="value">{loading ? "—" : total}</div>
        </div>
        <div className="stat-card">
          <span className="eyebrow">Active</span>
          <div className="value credit">{loading ? "—" : active}</div>
        </div>
        <div className="stat-card">
          <span className="eyebrow">Inactive</span>
          <div className="value">{loading ? "—" : inactive}</div>
        </div>
        <div className="stat-card">
          <span className="eyebrow">Low Balance</span>
          <div className="value">{alertsLoading ? "—" : lowBalance.length}</div>
        </div>
        <div className="stat-card">
          <span className="eyebrow">Low Stock</span>
          <div className="value">{alertsLoading ? "—" : lowStock.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Recently Registered</h3>
          <Link to="/admin/students" className="btn btn-ghost btn-sm">View all →</Link>
        </div>
        <div className="table-wrap">
          <table className="grid">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Joining Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonRows rows={5} cols={5} />}
              {!loading && recent.map((s) => (
                <tr key={s.studentId}>
                  <td className="td-id">
                    <Link to={`/admin/students/${s.studentId}`}>{s.studentId}</Link>
                  </td>
                  <td className="td-strong">{s.name}</td>
                  <td>{s.department}</td>
                  <td className="mono">{s.joiningDate}</td>
                  <td><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && recent.length === 0 && (
            <EmptyState glyph="＋" title="No students yet" description="Register your first student to get started." />
          )}
        </div>
      </div>

      <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginTop: "var(--space-4)" }}>
        <div className="card">
          <div className="card-head">
            <h3>Low Balance Students</h3>
            <Link to="/admin/students" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <div className="table-wrap">
            <table className="grid">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {alertsLoading && <SkeletonRows rows={4} cols={2} />}
                {!alertsLoading && lowBalance.map((w, idx) => {
                  // DTO fields: studentName, studentCode, currentBalance
                  const sName = w.studentName || w.name || w.student?.name || "Student";
                  const sCode = w.studentCode || w.studentId || w.student?.studentId || "";
                  const bal = w.currentBalance ?? w.balance ?? 0;
                  return (
                    <tr key={w.walletId || w.id || idx}>
                      <td>
                        <div className="td-strong">{sName}</div>
                        {sCode && <div className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>{sCode}</div>}
                      </td>
                      <td><WalletPill amount={bal} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!alertsLoading && lowBalance.length === 0 && (
              <EmptyState glyph="₹" title="No low balances" description="No students are below the alert threshold." />
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Low Stock Items</h3>
            <Link to="/admin/canteen" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <div className="table-wrap">
            <table className="grid">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {alertsLoading && <SkeletonRows rows={4} cols={2} />}
                {!alertsLoading && lowStock.map((it, idx) => {
                  const itemName = it.itemName || it.name || "Item";
                  const itemCode = it.itemCode || it.code || "";
                  const qty = it.stockQuantity !== undefined ? it.stockQuantity : (it.quantity !== undefined ? it.quantity : 0);
                  const unit = it.unit || "pcs";
                  return (
                    <tr key={it.id || idx}>
                      <td>
                        <div className="td-strong">{itemName}</div>
                        {itemCode && <div className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>{itemCode}</div>}
                      </td>
                      <td>
                        <div className="mono">{qty} {unit}</div>
                        <Badge tone={qty === 0 ? "debit" : "brass"}>
                          {qty === 0 ? "Out of stock" : "Low stock"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!alertsLoading && lowStock.length === 0 && (
              <EmptyState glyph="▤" title="No low stock items" description="All items are above their reorder threshold." />
            )}
          </div>
        </div>
      </div>


    </>
  );
}
