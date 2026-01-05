import API from "./axiosInstance";

export interface DropdownVendor {
  _id: string;
  name: string;
  isActive: boolean;
}

export const getVendors = () => API.get("/vendors");

export const getActiveVendors = () =>
  API.get("/vendors?activeOnly=true");

export const addVendor = (data: { name: string }) =>
  API.post("/vendors", data);

export const softDeleteVendor = (id: string) =>
  API.put(`/vendors/${id}/soft-delete`);

export const restoreVendor = (id: string) =>
  API.put(`/vendors/${id}/restore`); 

export const updateVendor = (id: string, data: { name: string }) =>
  API.put(`/vendors/${id}`, data);
