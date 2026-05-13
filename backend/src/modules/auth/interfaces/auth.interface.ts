export interface IAuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string | null;
}

export interface IAuthResponse {
  accessToken: string;
  user: IAuthUser;
}

export interface IRefreshTokenResponse {
  accessToken: string;
}
