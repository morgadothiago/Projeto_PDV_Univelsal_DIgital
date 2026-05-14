import { useQuery } from '@tanstack/react-query'
import { billingApi } from '../api/billing.api'

export function usePlanUsage(enabled = true) {
  return useQuery({
    queryKey: ['billing/usage'],
    queryFn: billingApi.getUsage,
    staleTime: 30_000,
    enabled,
  })
}
