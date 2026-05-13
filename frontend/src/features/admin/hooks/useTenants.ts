import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../api/admin.api'

export function useTenants(params?: {
  page?: number
  limit?: number
  search?: string
}) {
  return useQuery({
    queryKey: ['admin', 'tenants', params],
    queryFn: () => adminApi.getTenants(params),
    staleTime: 30 * 1000,
  })
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: adminApi.getMetrics,
    staleTime: 60 * 1000,
  })
}
