import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getStudent, getStudentWallet, setStudentStatus,
  resetStudentPassword, resendCredentials,
} from "../../api/adminApi";
import WalletStub from "../../components/WalletStub";
import { StatusBadge } from "../../components/Badge";
import { Skeleton } from "../../components/Skeleton";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast, apiErrorMessage } from "../../context/ToastContext";

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-faint)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{value ?? "—"}</div>
    </div>
  );
}

export default function StudentDetail() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getStudent(studentId), getStudentWallet(studentId)])
      .then(([sRes, wRes]) => {
        setStudent(sRes.data.data);
        setWallet(wRes.data.data);
      })
      .catch((err) => toast.error(apiErrorMessage(err, "Could not load student")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (type) => {
    setBusy(true);
    try {
      if (type === "toggle") {
        const nextActive = student.status !== "ACTIVE";
        await setStudentStatus(studentId, nextActive);
        toast.success(`Student ${nextActive ? "activated" : "deactivated"}`);
      } else if (type === "reset") {
        await resetStudentPassword(studentId);
        toast.success(`Password reset and emailed to ${student.email}`);
      } else if (type === "resend") {
        await resendCredentials(studentId);
        toast.success(`Credentials resent to ${student.email}`);
      }
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const confirmCopy = {
    toggle: {
      title: student?.status === "ACTIVE" ? "Deactivate student?" : "Activate student?",
      message: `This will ${student?.status === "ACTIVE" ? "immediately block" : "restore"} login and purchase access for ${student?.name}.`,
      confirmLabel: student?.status === "ACTIVE" ? "Deactivate" : "Activate",
      tone: student?.status === "ACTIVE" ? "danger" : "brass",
    },
    reset: {
      title: "Reset password?",
      message: `A new temporary password will be generated and emailed to ${student?.email}.`,
      confirmLabel: "Reset password",
      tone: "primary",
    },
    resend: {
      title: "Resend credentials?",
      message: `A fresh temporary password will be generated and sent to ${student?.email}.`,
      confirmLabel: "Resend",
      tone: "primary",
    },
  };

  if (loading) {
    return (
      <div className="card card-pad">
        <Skeleton h={28} w={220} />
        <div style={{ marginTop: 16 }}><Skeleton h={140} /></div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <>
      <div className="page-head">
        <div>
          <Link to="/admin/students" className="eyebrow">← Back to Students</Link>
          <h1 style={{ marginTop: 8 }}>{student.name}</h1>
          <p className="desc mono">{student.studentId} · {student.registrationNumber}</p>
        </div>
        <StatusBadge status={student.status} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, alignItems: "start" }}>
        <div className="card" style={{ padding: "16px 20px" }}>
          <h3 style={{ marginBottom: 12, fontSize: 14 }}>Profile</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
            <Field label="Email" value={student.email} />
            <Field label="Mobile" value={student.mobile} />
            <Field label="Date of Birth" value={student.dateOfBirth} />
            <Field label="Gender" value={student.gender} />
            <Field label="Department" value={student.department} />
            <Field label="Course" value={student.course} />
            <Field label="Year / Semester" value={`${student.year} / ${student.semester}`} />
            <Field label="Joining Date" value={student.joiningDate} />
            <Field label="Address" value={student.address} />
          </div>

          <div className="divider" style={{ margin: "10px 0" }} />

          <h3 style={{ marginBottom: 10, fontSize: 14 }}>Actions</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirm("toggle")}>
              {student.status === "ACTIVE" ? "Deactivate" : "Activate"}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirm("reset")}>Reset Password</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirm("resend")}>Resend Credentials</button>
          </div>
        </div>

        <WalletStub wallet={wallet} studentId={student.studentId} badge={student.status} />
      </div>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => doAction(confirm)}
        loading={busy}
        {...(confirm ? confirmCopy[confirm] : {})}
      />
    </>
  );
}
