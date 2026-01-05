import API from "./axiosInstance";

export const getPendingDiscrepancies = async () =>
  API.get("/admin/discrepancies/pending");

export const getResolvedDiscrepancies = async () =>
  API.get("/admin/discrepancies/history");

// export const resolveDiscrepancy = async (id: string) =>
//   API.put(`/admin/discrepancies/${id}/resolve`);

export const resolveDiscrepancy = (
  id: string,
  payload?: { resolutionRemarks?: string }
) => {
  return API.put(`/admin/discrepancies/${id}/resolve`, payload);
};

export const fetchPendingDiscrepancyCount = () =>
  API.get("/admin/discrepancies/pending-count");
