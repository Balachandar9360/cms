import api from "./axios";

export const getProfile = () => api.get("/student/profile");
export const getWallet = () => api.get("/student/wallet");
export const getTransactions = (page = 0, size = 10) =>
  api.get("/student/transactions", { params: { page, size } });
export const getCanteenItems = () => api.get("/student/canteen/items");
export const purchase = (items) => api.post("/student/purchases", { items });
export const getQrToken = () => api.post("/student/wallet/qr-token");

// ---- Feedback / ratings ----
export const getPendingFeedback = () => api.get("/student/feedback/pending");
export const submitFeedback = (purchaseItemId, rating, comment) =>
  api.post("/student/feedback", { purchaseItemId, rating, comment });
