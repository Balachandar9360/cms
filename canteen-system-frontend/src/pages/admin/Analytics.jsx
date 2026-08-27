import { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import {
  getSalesSummary, getRevenueByDay, getTopItems, getSalesByCategory, getPeakHours,
} from "../../api/adminApi";
import { SkeletonRows } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import { WalletPill, fmt } from "../../components/WalletStub";
import { useToast, apiErrorMessage } from "../../context/ToastContext";

// Pulled straight from tokens.css so charts match the app's palette.
const COLORS = ["#B9862B", "#2E7A52", "#33627A", "#B23B3B", "#5C6B63", "#93691E"];
const INK_MUTED = "#5C6B63";
const LINE = "#DBE1D6";
const SURFACE = "#FFFFFF";

const RANGE_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

function ChartCard({ title, action, children, empty, loading }) {
  return (
    <div className="card">
      <div className="card-head">
        <h3>{title}</h3>
        {action}
      </div>
      <div style={{ padding: "var(--space-4)", paddingTop: 0 }}>
        {loading && <div style={{ height: 260 }} />}
        {!loading && empty && (
          <EmptyState glyph="◱" title="No data yet" description="Nothing to show for this period." />
        )}
        {!loading && !empty && children}
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: SURFACE, border: `1px solid ${LINE}`, borderRadius: 8,
      padding: "8px 12px", fontSize: 12, boxShadow: "var(--shadow-md)",
    }}>
      <div style={{ color: INK_MUTED, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="mono" style={{ fontWeight: 600 }}>
          {formatter ? formatter(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const toast = useToast();

  const load = useCallback((rangeDays) => {
    setLoading(true);
    Promise.all([
      getSalesSummary(),
      getRevenueByDay(rangeDays),
      getTopItems(rangeDays, 8),
      getSalesByCategory(rangeDays),
      getPeakHours(rangeDays),
    ])
      .then(([s, r, t, c, p]) => {
        setSummary(s.data.data);
        setRevenue(r.data.data || []);
        setTopItems(t.data.data || []);
        setByCategory(c.data.data || []);
        setPeakHours(fillHours(p.data.data || []));
      })
      .catch((err) => toast.error(apiErrorMessage(err, "Could not load analytics")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(days); }, [days, load]);

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Insights</span>
          <h1>Sales Analytics</h1>
          <p className="desc">Revenue, best sellers, and traffic patterns across the canteen.</p>
        </div>
        <div className="row-actions">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`btn btn-sm ${days === opt.value ? "btn-brass" : "btn-ghost"}`}
              onClick={() => setDays(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="eyebrow">Today's Revenue</span>
          <div className="value">{!summary ? "—" : `₹${fmt(summary.todayRevenue)}`}</div>
        </div>
        <div className="stat-card">
          <span className="eyebrow">Last 7 Days</span>
          <div className="value credit">{!summary ? "—" : `₹${fmt(summary.weekRevenue)}`}</div>
        </div>
        <div className="stat-card">
          <span className="eyebrow">Last 30 Days</span>
          <div className="value">{!summary ? "—" : `₹${fmt(summary.monthRevenue)}`}</div>
        </div>
        <div className="stat-card">
          <span className="eyebrow">Avg Order Value</span>
          <div className="value">{!summary ? "—" : `₹${fmt(summary.avgOrderValue)}`}</div>
        </div>
        <div className="stat-card">
          <span className="eyebrow">Orders (30d)</span>
          <div className="value">{!summary ? "—" : summary.totalOrdersMonth}</div>
        </div>
      </div>

      <ChartCard title="Revenue over time" loading={loading} empty={revenue.length === 0}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={revenue}>
            <CartesianGrid stroke={LINE} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={{ stroke: LINE }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={false} tickLine={false} width={50} />
            <Tooltip content={<ChartTooltip formatter={(v) => `₹${fmt(v)}`} />} />
            <Line type="monotone" dataKey="revenue" stroke="#B9862B" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "var(--space-4)", marginTop: "var(--space-4)" }}>
        <ChartCard title="Best-selling items" loading={loading} empty={topItems.length === 0}>
          <div className="table-wrap">
            <table className="grid">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {loading && <SkeletonRows rows={5} cols={3} />}
                {!loading && topItems.map((it) => (
                  <tr key={it.itemCode}>
                    <td>
                      <div className="td-strong">{it.itemName}</div>
                      <div className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>{it.itemCode}</div>
                    </td>
                    <td className="mono">{it.quantitySold}</td>
                    <td><WalletPill amount={it.revenue} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        <ChartCard title="Sales by category" loading={loading} empty={byCategory.length === 0}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={byCategory}
                dataKey="revenue"
                nameKey="category"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip formatter={(v) => `₹${fmt(v)}`} />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
            {byCategory.map((c, i) => (
              <span key={c.category} style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: COLORS[i % COLORS.length] }} />
                {c.category}
              </span>
            ))}
          </div>
        </ChartCard>
      </div>

      <div style={{ marginTop: "var(--space-4)" }}>
        <ChartCard title="Orders by hour of day" loading={loading} empty={peakHours.every((h) => h.orderCount === 0)}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={peakHours}>
              <CartesianGrid stroke={LINE} vertical={false} />
              <XAxis dataKey="hourLabel" tick={{ fontSize: 10, fill: INK_MUTED }} axisLine={{ stroke: LINE }} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="orderCount" fill="#33627A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}

// Backend only returns hours that had orders — fill in the gaps so the
// bar chart shows a full 24-hour axis instead of a sparse, misleading one.
function fillHours(data) {
  const map = new Map(data.map((d) => [d.hour, d.orderCount]));
  return Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    hourLabel: `${h}:00`,
    orderCount: map.get(h) || 0,
  }));
}
