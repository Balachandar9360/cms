import api from "./axios";

export const login = (username, password) => {
  console.log("Login request:", {
    username,
    password: "***",
  });

  return api.post("/auth/login", {
    username,
    password,
  });
};

export const changePassword = (oldPassword, newPassword) => {
  return api.post("/auth/change-password", {
    oldPassword,
    newPassword,
  });
};