import { useQuery } from '@tanstack/react-query'
import { orderApi } from '../api/order.api'

export const orderKeys = {
  all: ['orders'] as const,
  list: (params: { page?: number; limit?: number }) =>
    [...orderKeys.all, 'list', params] as const,
}

export function useOrders(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderApi.findAll(params),
  })
}
