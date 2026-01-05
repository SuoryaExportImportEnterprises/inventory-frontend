import API from "./axiosInstance";

export interface InwardType {
  _id: string;
  billDate?: string;
  type?: string;
   item: string;     // ✅ ID only
  vendor: string;   // ✅ ID only  
  unit?: string;
  quantityOnBill?: number;
  quantityReceived?: number;
  quantityRejected?: number;
  quantityDiscrepancy?: number;
  quantityActual?: number;
  remarks?: string;
  createdAt?: string;
}

export interface UpdateAdminInwardPayload {
  quantityReceived?: number;
  quantityRejected?: number;
  discrepancyRemarks?: string;
  rejectionRemarks?: string;
  remarks?: string;
}


export const getMyInwards = () => API.get("/inwards/my");

export const getMyInwardById = (id: string) =>
  API.get(`/inwards/my/${id}`);

export const getAdminInwards = () => API.get("/inwards/admin");

export const getAdminInwardById = (id: string) =>
  API.get(`/inwards/admin/${id}`);

export type CreateInwardPayload = Omit<InwardType, '_id' | 'createdAt'>;

export const createInward = (data: CreateInwardPayload) =>
  API.post('/inwards', data);

export const updateAdminInward = (
  id: string,
  data: UpdateAdminInwardPayload
) =>
  API.patch(`/inwards/admin/${id}`, data);
