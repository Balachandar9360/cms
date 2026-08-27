import api from "./axios";

// ---- Students ----
export const registerStudent = (data) => api.post("/admin/students", data);
export const listStudents = (search = "", page = 0, size = 10) =>
  api.get("/admin/students", { params: { search, page, size } });
export const getStudent = (studentId) => api.get(`/admin/students/${studentId}`);
export const setStudentStatus = (studentId, active) =>
  api.patch(`/admin/students/${studentId}/status`, null, { params: { active } });
export const resetStudentPassword = (studentId) =>
  api.post(`/admin/students/${studentId}/reset-password`);
export const resendCredentials = (studentId) =>
  api.post(`/admin/students/${studentId}/resend-credentials`);
export const getStudentWallet = (studentId) => api.get(`/admin/students/${studentId}/wallet`);

// Dev/admin utility: manually run this student's monthly allocation now,
// instead of waiting for the 1st-of-month cron job.
export const triggerMonthlyAllocation = (studentId) =>
  api.post(`/admin/students/${studentId}/trigger-monthly-allocation`);

// ---- Canteen items ----
export const listCanteenItems = () => api.get("/admin/canteen/items");
export const createCanteenItem = (data) => api.post("/admin/canteen/items", data);
export const updateCanteenItem = (id, data) => api.put(`/admin/canteen/items/${id}`, data);
export const setCanteenItemStatus = (id, active) =>
  api.patch(`/admin/canteen/items/${id}/status`, null, { params: { active } });

// ---- Stock (low stock alerts, restock/adjust) ----
export const listLowStockItems = () =>
  api.get("/canteen/items/low-stock").catch(() => api.get("/admin/canteen/items/low-stock"));
export const restockItem = (id, quantity, reason) =>
  api.post(`/admin/canteen/items/${id}/restock`, null, { params: { quantity, reason } });
export const adjustItemStock = (id, delta, reason) =>
  api.post(`/admin/canteen/items/${id}/adjust`, null, { params: { delta, reason } });
export const triggerLowStockCheck = () =>
  api.post("/admin/canteen/items/check-low-stock");

// ---- Wallet low-balance alerts ----
export const listLowBalanceWallets = () =>
  api.get("/wallet/low-balance").catch(() => api.get("/admin/wallet/low-balance"));
export const listBalanceAlertLogs = () =>
  api.get("/wallet/alert-logs").catch(() => api.get("/admin/wallet/alert-logs"));
export const triggerLowBalanceCheck = () =>
  api.post("/wallet/check-low-balance").catch(() => api.post("/admin/wallet/check-low-balance"));

// ---- Run both checks together (used by the "Run checks now" button) ----
export const runAllChecks = () =>
  api.post("/admin/checks/run-all").catch(() => api.post("/checks/run-all"));

// ---- Sales analytics ----
export const getSalesSummary = () => api.get("/admin/analytics/summary");
export const getRevenueByDay = (days = 30) => api.get("/admin/analytics/revenue", { params: { days } });
export const getTopItems = (days = 30, limit = 10) =>
  api.get("/admin/analytics/top-items", { params: { days, limit } });
export const getSalesByCategory = (days = 30) => api.get("/admin/analytics/by-category", { params: { days } });
export const getPeakHours = (days = 30) => api.get("/admin/analytics/peak-hours", { params: { days } });

// ---- QR checkout (counter scanner) ----
// Static QR flow: QR encodes studentId → lookup student → build cart → purchase
export const qrLookupStudent = (studentId) =>
  api.get(`/admin/students/${studentId}`);
export const qrPurchaseForStudent = (studentId, items) =>
  api.post("/admin/checkout/qr-purchase", { studentId, items });

// Legacy token-based QR (kept for backward-compat)
export const qrPreview = (qrToken) =>
  api.post("/admin/checkout/qr-preview", null, { params: { qrToken } });
export const qrPurchase = (qrToken, items) =>
  api.post("/admin/checkout/qr-purchase", { qrToken, items });

// ---- Feedback / ratings ----
export const getRatingSummary = () => api.get("/admin/feedback/summary");
export const getAllFeedback = (page = 0, size = 20) =>
  api.get("/admin/feedback", { params: { page, size } });
export const getFeedbackForItem = (itemId, page = 0, size = 20) =>
  api.get(`/admin/feedback/item/${itemId}`, { params: { page, size } });
