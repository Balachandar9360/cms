import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/auth/Login";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import StudentDetail from "./pages/admin/StudentDetail";
import RegisterStudent from "./pages/admin/RegisterStudent";
import CanteenItems from "./pages/admin/CanteenItems";
import Analytics from "./pages/admin/Analytics";
import QrCheckout from "./pages/admin/QrCheckout";
import Feedback from "./pages/admin/Feedback";

import StudentLayout from "./pages/student/StudentLayout";
import StudentDashboard from "./pages/student/Dashboard";
import Canteen from "./pages/student/Canteen";
import Transactions from "./pages/student/Transactions";
import ChangePassword from "./pages/student/ChangePassword";
import PayAtCounter from "./pages/student/PayAtCounter";

function Root() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/admin"
              element={<ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>}
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="students/new" element={<RegisterStudent />} />
              <Route path="students/:studentId" element={<StudentDetail />} />
              <Route path="canteen" element={<CanteenItems />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="qr-checkout" element={<QrCheckout />} />
              <Route path="feedback" element={<Feedback />} />
            </Route>

            <Route
              path="/student"
              element={<ProtectedRoute role="STUDENT"><StudentLayout /></ProtectedRoute>}
            >
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="canteen" element={<Canteen />} />
              <Route path="pay-at-counter" element={<PayAtCounter />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
