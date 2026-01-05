import API from "./axiosInstance";

export interface OutwardType {
  _id: string;
  item: { _id: string; name: string, currentStock?: number; };
  vendor?: { _id: string; name: string } | string;
  quantity: number;
  unit: string;
  type: string;
  costPerUnitAtTime: number;
  totalCost: number;
  remarks?: string;
  outwardDate: string;
  createdAt: string;
  createdBy?: { username: string; role: string };
}

// INVENTORY
export const getMyOutwards = () => API.get("/outwards/my");
export const getMyOutwardById = (id: string) =>
  API.get(`/outwards/my/${id}`);

// ADMIN
export const getAdminOutwards = () => API.get("/outwards/admin");
export const getAdminOutwardById = (id: string) =>
  API.get(`/outwards/admin/${id}`);

// CREATE
export const createOutward = (data: Partial<OutwardType>) =>
   API.post("/outwards", data);

export const adminUpdateOutward = (
  id: string,
  data: { quantity?: number; remarks?: string }
) =>
  API.patch(`/outwards/admin/${id}`, data);


