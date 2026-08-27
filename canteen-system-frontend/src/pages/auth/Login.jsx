import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleMouseDown = (e) => {
    e.preventDefault();
    setShowPassword(true);
  };

  const handleMouseUp = (e) => {
    if (e) e.preventDefault();
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(username.trim(), password);
      console.log("Logged in user object:", user);
      if (!user || !user.role) {
        throw new Error("Invalid response from server: Missing role");
      }
      navigate(user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard", { replace: true });
    } catch (err) {
      console.error("Login failed error detail:", err);
      const msg = err?.response?.data?.message || err?.message || (err?.code === "ERR_NETWORK" ? "Cannot connect to server. Check if backend on port 8080 is running and CORS is enabled." : "Invalid username or password");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-side">
        <div className="login-hero-bg" />
        <div className="login-side-inner">
          <div className="login-brand-header">
            <span className="brand-badge-icon">AC</span>
            <span className="brand-badge-title">ARUNAI CAMPUS DINING SERVICES</span>
          </div>
          <h1>Smart Canteen Wallet Management</h1>
          <p>
            Streamlining campus food services with secure digital ledger accounts, 
            instant order processing, and real-time transaction verification for students and administration.
          </p>
          <div className="login-stat-row">
            <div className="login-stat">
              <div className="n">Fast & Secure</div>
              <div className="l">Instant Top-Up</div>
            </div>
            <div className="login-stat">
              <div className="n">100%</div>
              <div className="l">Digital Records</div>
            </div>
            <div className="login-stat">
              <div className="n">Real-Time</div>
              <div className="l">Ledger Sync</div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-form-card">
          <h2>Welcome back</h2>
          <p className="sub">Please enter your credentials to access your account.</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-field full">
              <label>Username / Student ID<span className="req">*</span></label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. STU20260002 or admin"
                autoFocus
                required
              />
            </div>
            <div className="form-field full">
              <label>Password<span className="req">*</span></label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleMouseDown}
                  onTouchEnd={handleMouseUp}
                  onTouchCancel={handleMouseUp}
                  onClick={(e) => e.preventDefault()}
                  aria-label="Press & hold to view password"
                  title="Press & hold to view password"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-brass btn-block" disabled={loading} style={{ marginTop: 8 }}>
              {loading && <span className="btn-spinner" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
