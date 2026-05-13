export interface IStockEntry {
  id: string;
  tenantId: string;
  productId: string;
  userId: string;
  quantity: number;
  reason: string | null;
  createdAt: Date;
}

export interface ICreateStockEntry {
  tenantId: string;
  productId: string;
  userId: string;
  quantity: number;
  reason?: string;
}

export interface IStockEntryList {
  data: IStockEntry[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface IStockAlert {
  productId: string;
  productName: string;
  stock: number;
  stockThreshold: number;
}
