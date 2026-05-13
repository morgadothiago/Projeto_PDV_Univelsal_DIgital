import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type {
  IAdminMetrics,
  ICreateTenantPayload,
  ITenant,
  ITenantsResponse,
  ITenantSummary,
} from '../interfaces/admin.interface'

export const adminApi = {
  getMetrics: async (): Promise<IAdminMetrics> => {
    const res = await api.get<ApiResponse<IAdminMetrics>>('/admin/metrics')
    return res.data.data
  },

  getTenants: async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<ITenantsResponse> => {
    const res = await api.get<ApiResponse<ITenantsResponse>>('/tenants', { params })
    return res.data.data
  },

  getTenantById: async (id: string): Promise<ITenant> => {
    const res = await api.get<ApiResponse<ITenant>>(`/tenants/${id}`)
    return res.data.data
  },

  getTenantSummary: async (id: string): Promise<ITenantSummary> => {
    const res = await api.get<ApiResponse<ITenantSummary>>(`/admin/tenants/${id}/summary`)
    return res.data.data
  },

  createTenant: async (payload: ICreateTenantPayload): Promise<ITenant> => {
    const res = await api.post<ApiResponse<ITenant>>('/tenants', payload)
    return res.data.data
  },

  updateTenant: async (id: string, payload: Partial<ICreateTenantPayload>): Promise<ITenant> => {
    const res = await api.patch<ApiResponse<ITenant>>(`/tenants/${id}`, payload)
    return res.data.data
  },

  suspendTenant: async (id: string): Promise<ITenant> => {
    const res = await api.delete<ApiResponse<ITenant>>(`/tenants/${id}`)
    return res.data.data
  },
}
