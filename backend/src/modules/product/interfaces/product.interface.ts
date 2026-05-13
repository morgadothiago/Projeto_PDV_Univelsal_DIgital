export interface IProduct {
  id: string;
  tenantId: string;
  name: string;
  price: number;
  unitType: 'unit' | 'weight' | 'digital';
  categoryId: string | null;
  stock: number;
  stockThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductWithCategory extends IProduct {
  category: { id: string; name: string } | null;
}

export interface ICreateProduct {
  tenantId: string;
  name: string;
  price: number;
  unitType: 'unit' | 'weight' | 'digital';
  categoryId?: string;
  stockThreshold?: number;
}

export interface IUpdateProduct {
  name?: string;
  price?: number;
  unitType?: 'unit' | 'weight' | 'digital';
  categoryId?: string;
  stockThreshold?: number;
  isActive?: boolean;
}

export interface IProductList {
  data: IProductWithCategory[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface IProductListQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  isActive?: boolean;
}
