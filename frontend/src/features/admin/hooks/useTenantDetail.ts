import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../api/admin.api'

export function useTenantDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'tenants', id],
    queryFn: () => adminApi.getTenantById(id),
    staleTime: 30 * 1000,
    enabled: Boolean(id),
  })
}
