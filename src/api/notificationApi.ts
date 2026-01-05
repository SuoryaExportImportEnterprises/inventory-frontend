import API from "./axiosInstance";
export const fetchNotifications = () =>
  API.get("/notifications");

export const markNotificationRead = (id: string) =>
  API.put(`/notifications/${id}/read`);