export interface RecentInward {
  _id: string;
  item: {
    name: string;
    unit: string;
  };
  vendor: {
    name: string;
  };
  quantityActual: number;
  createdAt: string;
}

export interface RecentOutward {
  _id: string;
  item: {
    name: string;
    unit: string;
  };
  vendor: {
    name: string;
  };
  quantity: number;
  createdAt: string;
}
