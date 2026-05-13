export interface ICategory {
  id: string;
  tenantId: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCategory {
  tenantId: string;
  name: string;
}

export interface IUpdateCategory {
  name?: string;
  isActive?: boolean;
}
