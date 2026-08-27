import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Frontend route protection is UX only - the backend independently
// enforces role checks on every /api/admin/** and /api/student/** call.
export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;

  return children;
}
