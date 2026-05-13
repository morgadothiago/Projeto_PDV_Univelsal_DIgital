import type { Role } from '@/types/roles.types'

export interface ILoginRequest {
  email: string
  password: string
}

export interface IAuthUser {
  id: string
  tenantId: string | null
  email: string
  name: string
  role: Role
}

export interface ILoginResponse {
  accessToken: string
  user: IAuthUser
}
