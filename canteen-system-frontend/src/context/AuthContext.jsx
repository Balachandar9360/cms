import { createContext, useContext, useState } from "react";
import { login as loginApi } from "../api/authApi";

const AuthContext = createContext(null);

// Normalizes whatever shape the backend returns login data in, so the
// rest of the app can rely on a single consistent { role, studentId,
// username } user object regardless of exact backend field naming.
function normalizeUser(data) {
  const nested = data.user || {};
  let role = nested.role || data.role;
  if (role && role.startsWith("ROLE_")) {
    role = role.replace("ROLE_", "");
  }
  const username = nested.username || data.username || nested.studentId || data.studentId;
  const storedAvatar = username ? localStorage.getItem(`avatar_${username}`) : null;
  return {
    role: role,
    studentId: nested.studentId || data.studentId || (role !== "ADMIN" ? nested.username || data.username : undefined),
    username: username,
    name: nested.name || data.name,
    avatar: storedAvatar || nested.avatar || data.avatar || null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed && parsed.username) {
      const avatar = localStorage.getItem(`avatar_${parsed.username}`);
      if (avatar) parsed.avatar = avatar;
    }
    return parsed;
  });

  const login = async (username, password) => {
    const { data } = await loginApi(username, password);
    const payload = data.data || {};
    const token = payload.token;
    const normalized = normalizeUser(payload);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(normalized));
    setUser(normalized);
    return normalized;
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      if (prev.username && updates.avatar !== undefined) {
        if (updates.avatar) {
          localStorage.setItem(`avatar_${prev.username}`, updates.avatar);
        } else {
          localStorage.removeItem(`avatar_${prev.username}`);
        }
      }
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
