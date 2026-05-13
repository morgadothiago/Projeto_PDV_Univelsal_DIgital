import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export interface ITenantSettings {
  primaryColor?: string
  logoUrl?: string
}

export interface ITenantResponse {
  id: string
  name: string
  type: string
  plan: string
  stockEnabled: boolean
  isActive: boolean
  settings: ITenantSettings | null
  createdAt: string
  updatedAt: string
}

export const tenantApi = {
  getMyTenant: async (): Promise<ITenantResponse> => {
    const res = await api.get<ApiResponse<ITenantResponse>>('/tenants/me')
    return res.data.data
  },

  updateMySettings: async (settings: ITenantSettings): Promise<ITenantResponse> => {
    const res = await api.patch<ApiResponse<ITenantResponse>>('/tenants/me/settings', settings)
    return res.data.data
  },
}
