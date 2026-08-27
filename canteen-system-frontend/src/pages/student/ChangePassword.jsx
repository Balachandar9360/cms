import { useState } from "react";
import { changePassword } from "../../api/authApi";
import { useToast, apiErrorMessage } from "../../context/ToastContext";

/* Eye icon SVG — reusable inline */
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* A password field with its own independent show/hide toggle */
function PasswordField({ id, label, value, onChange, required, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div className="form-field full">
      <label htmlFor={id}>{label}<span className="req">*</span></label>
      <div className="password-input-wrapper">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          title={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff /> : <EyeOpen />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await changePassword(oldPassword, newPassword);
      toast.success("Password updated successfully");
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not change password"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Security</span>
          <h1>Change Password</h1>
          <p className="desc">Use this after your first login with a temporary password, or anytime you'd like to rotate it.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card card-pad" style={{ maxWidth: 420 }}>
        <PasswordField
          id="current-password"
          label="Current Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <PasswordField
          id="new-password"
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
        />
        <PasswordField
          id="confirm-password"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
        <button
          type="submit"
          className="btn btn-brass btn-block"
          disabled={saving}
          style={{ marginTop: 8 }}
        >
          {saving && <span className="btn-spinner" />}
          {saving ? "Updating…" : "Update Password"}
        </button>
      </form>
    </>
  );
}
