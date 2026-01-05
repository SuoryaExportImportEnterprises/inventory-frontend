import API from "./axiosInstance";

export const getDashboardData = async () => API.get("/admin/dashboard");
export const fetchInventoryDashboard = () =>
  API.get("/dashboard/inventory");