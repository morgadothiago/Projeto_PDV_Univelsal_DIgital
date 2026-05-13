export interface IUser {
  id: string;
  tenantId: string | null;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserListQuery {
  page: number;
  limit: number;
}
