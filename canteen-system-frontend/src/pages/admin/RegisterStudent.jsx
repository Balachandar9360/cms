import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerStudent } from "../../api/adminApi";
import { useToast, apiErrorMessage } from "../../context/ToastContext";

const EMPTY = {
  name: "", registrationNumber: "", email: "", mobile: "", dateOfBirth: "",
  gender: "MALE", department: "", course: "", year: "", semester: "",
  address: "", joiningDate: "",
};

/* ── Validation rules ── */
function validateEmail(val) {
  if (!val.trim()) return "Email is required";
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(val.trim())) return "Enter a valid email address (e.g. john@example.com)";
  return "";
}

function validateMobile(val) {
  if (!val.trim()) return "Mobile number is required";
  if (!/^[6-9]\d{9}$/.test(val.trim()))
    return "Enter a valid 10-digit Indian mobile number (starts with 6–9)";
  return "";
}

function validateDOB(val) {
  if (!val) return "Date of birth is required";
  const dob = new Date(val);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dob >= today) return "Date of birth cannot be today or a future date";
  const age = today.getFullYear() - dob.getFullYear() -
    (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
  if (age < 10) return "Student must be at least 10 years old";
  if (age > 100) return "Date of birth seems incorrect (age > 100)";
  return "";
}

export default function RegisterStudent() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const set = (key) => (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
    // Clear error live as user types after field was touched
    if (touched[key]) {
      setErrors((err) => ({ ...err, [key]: runValidation(key, val) }));
    }
  };

  const runValidation = (key, val) => {
    if (key === "email") return validateEmail(val);
    if (key === "mobile") return validateMobile(val);
    if (key === "dateOfBirth") return validateDOB(val);
    return "";
  };

  const handleBlur = (key) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((err) => ({ ...err, [key]: runValidation(key, form[key]) }));
  };

  const validateAll = () => {
    const newErrors = {
      email: validateEmail(form.email),
      mobile: validateMobile(form.mobile),
      dateOfBirth: validateDOB(form.dateOfBirth),
    };
    setErrors(newErrors);
    setTouched({ email: true, mobile: true, dateOfBirth: true });
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error("Please fix the highlighted errors before submitting.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await registerStudent(form);
      toast.success(`${data.data.studentId} registered. Welcome email sent to ${data.data.email}.`);
      navigate(`/admin/students/${data.data.studentId}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Registration failed"));
    } finally {
      setSaving(false);
    }
  };

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <>
      <div className="page-head">
        <div>
          <Link to="/admin/students" className="eyebrow">← Back to Students</Link>
          <h1 style={{ marginTop: 8 }}>Register Student</h1>
          <p className="desc">A Student ID, temp password, and wallet are generated automatically on submit.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card card-pad" style={{ maxWidth: 780 }}>
        <div className="form-grid">
          <div className="form-field">
            <label>Full Name<span className="req">*</span></label>
            <input value={form.name} onChange={set("name")} required />
          </div>
          <div className="form-field">
            <label>Registration Number<span className="req">*</span></label>
            <input value={form.registrationNumber} onChange={set("registrationNumber")} required />
          </div>

          {/* Email with validation */}
          <div className="form-field">
            <label>Email<span className="req">*</span></label>
            <input
              type="text"
              value={form.email}
              onChange={set("email")}
              onBlur={handleBlur("email")}
              className={errors.email && touched.email ? "input-error" : ""}
              placeholder="student@example.com"
              required
            />
            {errors.email && touched.email && (
              <span className="error-text">⚠ {errors.email}</span>
            )}
          </div>

          {/* Mobile with validation */}
          <div className="form-field">
            <label>Mobile<span className="req">*</span></label>
            <input
              type="tel"
              value={form.mobile}
              onChange={set("mobile")}
              onBlur={handleBlur("mobile")}
              className={errors.mobile && touched.mobile ? "input-error" : ""}
              placeholder="10-digit number"
              maxLength={10}
              required
            />
            {errors.mobile && touched.mobile && (
              <span className="error-text">⚠ {errors.mobile}</span>
            )}
          </div>

          {/* Date of Birth with validation */}
          <div className="form-field">
            <label>Date of Birth<span className="req">*</span></label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={set("dateOfBirth")}
              onBlur={handleBlur("dateOfBirth")}
              className={errors.dateOfBirth && touched.dateOfBirth ? "input-error" : ""}
              max={new Date(new Date().setDate(new Date().getDate() - 1))
                .toISOString().split("T")[0]}
              required
            />
            {errors.dateOfBirth && touched.dateOfBirth && (
              <span className="error-text">⚠ {errors.dateOfBirth}</span>
            )}
          </div>

          <div className="form-field">
            <label>Gender<span className="req">*</span></label>
            <select value={form.gender} onChange={set("gender")} required>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="form-field">
            <label>Department<span className="req">*</span></label>
            <input value={form.department} onChange={set("department")} required />
          </div>
          <div className="form-field">
            <label>Course<span className="req">*</span></label>
            <input value={form.course} onChange={set("course")} required placeholder="e.g. B.Tech" />
          </div>

          <div className="form-field">
            <label>Year<span className="req">*</span></label>
            <input value={form.year} onChange={set("year")} required placeholder="e.g. 2" />
          </div>
          <div className="form-field">
            <label>Semester<span className="req">*</span></label>
            <input value={form.semester} onChange={set("semester")} required placeholder="e.g. 3" />
          </div>

          <div className="form-field">
            <label>Joining Date<span className="req">*</span></label>
            <input type="date" value={form.joiningDate} onChange={set("joiningDate")} required />
          </div>
          <div className="form-field">
            <label>Address<span className="req">*</span></label>
            <input value={form.address} onChange={set("address")} required />
          </div>
        </div>

        <div className="divider" />

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
          {hasErrors && (
            <span style={{ fontSize: 12.5, color: "var(--debit)" }}>
              Fix the errors above before submitting
            </span>
          )}
          <Link to="/admin/students" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-brass" disabled={saving || hasErrors}>
            {saving && <span className="btn-spinner" />}
            {saving ? "Registering…" : "Register Student"}
          </button>
        </div>
      </form>
    </>
  );
}
