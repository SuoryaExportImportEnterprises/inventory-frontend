import API from "./axiosInstance";

interface BuyerData {
  name: string;
}

export const getBuyers = async () => API.get("/buyers");
export const createBuyer = async (data: BuyerData) => API.post("/admin/buyers", data);
