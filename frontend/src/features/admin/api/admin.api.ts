import { api } from '@/lib/axios'
import type {
  IAdminMetrics,
  ICreateTenantPayload,
  ITenant,
  ITenantsResponse,
} from '../interfaces/admin.interface'

export const adminApi = {
  getMetrics: async (): Promise<IAdminMetrics> => {
    const res = await api.get<IAdminMetrics>('/admin/metrics')
    return res.data
  },

  getTenants: async (params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<ITenantsResponse> => {
    const res = await api.get<ITenantsResponse>('/tenants', { params })
    return res.data
  },

  getTenantById: async (id: string): Promise<ITenant> => {
    const res = await api.get<ITenant>(`/tenants/${id}`)
    return res.data
  },

  createTenant: async (payload: ICreateTenantPayload): Promise<ITenant> => {
    const res = await api.post<ITenant>('/tenants', payload)
    return res.data
  },

  updateTenant: async (id: string, payload: Partial<ICreateTenantPayload>): Promise<ITenant> => {
    const res = await api.patch<ITenant>(`/tenants/${id}`, payload)
    return res.data
  },

  suspendTenant: async (id: string): Promise<ITenant> => {
    const res = await api.delete<ITenant>(`/tenants/${id}`)
    return res.data
  },
}
