import API from "./axiosInstance";

export interface DropdownItem {
  _id: string;
  name: string;
  isActive: boolean;
}

export const getItems = () =>
  API.get<DropdownItem[]>("/items");

export const getActiveItems = (params?: { type?: string }) => {
  const query = new URLSearchParams();

  query.append("activeOnly", "true");

  if (params?.type) {
    query.append("type", params.type);
  }

  return API.get<DropdownItem[]>(`/items?${query.toString()}`);
};

export const addItem = (data: { name: string; type: string}) =>
  API.post("/items", data); 

export const softDeleteItem = (id: string) =>
  API.put(`/items/${id}/soft-delete`);

export const restoreItem = (id: string) =>
  API.put(`/items/${id}/restore`);


export const updateItemCost = (id: string, costPerUnit: number) =>
  API.patch(`/items/${id}/cost`, { costPerUnit });


export const getItemsByType = (type: string) =>
  API.get(`/items?type=${encodeURIComponent(type)}`);

export const getActiveItemsByType = (type: string) =>
  API.get(`/items?activeOnly=true&type=${encodeURIComponent(type)}`);

export const updateItem = (id: string, data: { name: string; type: string }) =>
  API.put(`/items/${id}`, data);
