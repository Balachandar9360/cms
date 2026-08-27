import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TopBar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="topbar">
      <div className="topbar-title-wrapper">
        <div className="topbar-role-icon-badge">
          {isAdmin ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          )}
        </div>
        <h2 className="topbar-title">{title}</h2>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        Log out
      </button>
    </header>
  );
}
