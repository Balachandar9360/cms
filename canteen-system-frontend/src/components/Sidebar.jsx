import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileModal from "./ProfileModal";

const ADMIN_LINKS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "◈" },
  { to: "/admin/students", label: "Students", icon: "☰" },
  { to: "/admin/canteen", label: "Canteen Items", icon: "▤" },
  { to: "/admin/analytics", label: "Analytics", icon: "◱" },
  { to: "/admin/qr-checkout", label: "QR Checkout", icon: "◫" },
  { to: "/admin/feedback", label: "Feedback", icon: "★" },
];

const STUDENT_LINKS = [
  { to: "/student/dashboard", label: "Dashboard", icon: "◈" },
  { to: "/student/canteen", label: "Canteen", icon: "▤" },
  { to: "/student/pay-at-counter", label: "Pay at Counter", icon: "◫" },
  { to: "/student/transactions", label: "Transactions", icon: "☰" },
  { to: "/student/change-password", label: "Security", icon: "◆" },
];

export default function Sidebar({ role, open }) {
  const { user } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const links = role === "ADMIN" ? ADMIN_LINKS : STUDENT_LINKS;

  const displayName = user?.name || user?.studentId || user?.username || (role === "ADMIN" ? "Admin User" : "Student");
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <aside className={`sidebar${open ? " open" : ""}`}>
        <div
          className="sidebar-brand sidebar-profile-clickable"
          onClick={() => setProfileModalOpen(true)}
          title="Click to update profile"
        >
          <div className="sidebar-user-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="sidebar-avatar-img" />
            ) : (
              <div className="brand-mark">{initials}</div>
            )}
          </div>
          <div className="sidebar-user-info">
            <div className="brand-name">{displayName}</div>
            <div className="brand-sub">
              <span className="portal-badge">{role === "ADMIN" ? "ADMIN CONSOLE" : "STUDENT PORTAL"}</span>
            </div>
          </div>
        </div>

        <nav className="nav-group">
          <span className="nav-label">Navigate</span>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <span className="dot" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <span className="nav-label" style={{ padding: 0 }}>Canteen Ledger v1.0</span>
        </div>
      </aside>

      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}
