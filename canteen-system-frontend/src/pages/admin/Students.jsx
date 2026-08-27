import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listStudents, setStudentStatus, resetStudentPassword, resendCredentials } from "../../api/adminApi";
import { StatusBadge } from "../../components/Badge";
import { SkeletonRows } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast, apiErrorMessage } from "../../context/ToastContext";

export default function Students() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type, student }
  const toast = useToast();
  const size = 10;

  const load = useCallback(() => {
    setLoading(true);
    listStudents(search, page, size)
      .then((res) => setData(res.data.data))
      .catch((err) => toast.error(apiErrorMessage(err, "Could not load students")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const runAction = async () => {
    if (!confirm) return;
    const { type, student } = confirm;
    setBusyId(student.studentId);
    try {
      if (type === "toggle") {
        const nextActive = student.status !== "ACTIVE";
        await setStudentStatus(student.studentId, nextActive);
        toast.success(`${student.studentId} ${nextActive ? "activated" : "deactivated"}`);
      } else if (type === "reset") {
        await resetStudentPassword(student.studentId);
        toast.success(`Password reset and emailed to ${student.email}`);
      } else if (type === "resend") {
        await resendCredentials(student.studentId);
        toast.success(`Credentials resent to ${student.email}`);
      }
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  };

  const confirmCopy = {
    toggle: (s) => ({
      title: s.status === "ACTIVE" ? "Deactivate student?" : "Activate student?",
      message: `${s.status === "ACTIVE" ? "Deactivating" : "Activating"} ${s.name} (${s.studentId}) will ${
        s.status === "ACTIVE" ? "block their login and purchases immediately." : "restore their access to log in and purchase."
      }`,
      confirmLabel: s.status === "ACTIVE" ? "Deactivate" : "Activate",
      tone: s.status === "ACTIVE" ? "danger" : "brass",
    }),
    reset: (s) => ({
      title: "Reset password?",
      message: `A new temporary password will be generated for ${s.studentId} and emailed to ${s.email}.`,
      confirmLabel: "Reset password",
      tone: "primary",
    }),
    resend: (s) => ({
      title: "Resend credentials?",
      message: `A fresh temporary password will be generated and sent to ${s.email}. Use this if the original welcome email never arrived.`,
      confirmLabel: "Resend",
      tone: "primary",
    }),
  };

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Directory</span>
          <h1>Students</h1>
          <p className="desc">Search, manage status, and handle credentials for every registered student.</p>
        </div>
        <Link to="/admin/students/new" className="btn btn-brass">+ Register Student</Link>
      </div>

      <div className="toolbar">
        <div className="search-input">
          <span className="icon">⌕</span>
          <input
            placeholder="Search by name or student ID…"
            value={search}
            onChange={(e) => { setPage(0); setSearch(e.target.value); }}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="grid">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Course / Year</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonRows rows={6} cols={6} />}
              {!loading && data.content.map((s) => (
                <tr key={s.studentId}>
                  <td className="td-id">
                    <Link to={`/admin/students/${s.studentId}`}>{s.studentId}</Link>
                  </td>
                  <td className="td-strong">{s.name}</td>
                  <td>{s.department}</td>
                  <td>{s.course} · Yr {s.year}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/admin/students/${s.studentId}`} className="btn btn-ghost btn-sm">View</Link>
                      <button
                        className="btn btn-ghost btn-sm"
                        disabled={busyId === s.studentId}
                        onClick={() => setConfirm({ type: "toggle", student: s })}
                      >
                        {s.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && data.content.length === 0 && (
            <EmptyState
              glyph="⌕"
              title="No students found"
              description={search ? `No results for "${search}".` : "Register your first student to get started."}
            />
          )}
        </div>
        <Pagination
          page={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={size}
          onChange={setPage}
        />
      </div>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={runAction}
        loading={!!busyId}
        {...(confirm ? confirmCopy[confirm.type](confirm.student) : {})}
      />
    </>
  );
}
