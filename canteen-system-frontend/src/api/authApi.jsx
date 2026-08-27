import api from "./axios";

export const login = (username, password) =>
  api.post("/auth/login", { username, password });

export const changePassword = (oldPassword, newPassword) =>
  api.post("/auth/change-password", { oldPassword, newPassword });
