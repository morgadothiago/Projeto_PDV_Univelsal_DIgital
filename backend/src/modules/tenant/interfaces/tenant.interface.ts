export interface ITenant {
  id: string;
  name: string;
  type: string;
  plan: string;
  stockEnabled: boolean;
  isActive: boolean;
  settings: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateTenantWithOwner {
  tenantName: string;
  tenantType: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}

export interface ITenantListQuery {
  page: number;
  limit: number;
  search?: string;
}
