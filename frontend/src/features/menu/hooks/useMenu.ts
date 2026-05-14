import { useQuery, useMutation } from '@tanstack/react-query'
import { menuApi } from '@/features/menu/api/menu.api'
import type { ICreateMenuOrderPayload } from '@/features/menu/interfaces/menu.interface'

const STALE_TIME = 5 * 60 * 1000 // 5 minutes

export const menuKeys = {
  tenant: (tenantId: string) => ['menu', 'tenant', tenantId] as const,
  products: (tenantId: string) => ['menu', 'products', tenantId] as const,
  categories: (tenantId: string) => ['menu', 'categories', tenantId] as const,
}

export function useMenuTenant(tenantId: string) {
  return useQuery({
    queryKey: menuKeys.tenant(tenantId),
    queryFn: () => menuApi.getTenantInfo(tenantId),
    staleTime: STALE_TIME,
    retry: 1,
    enabled: Boolean(tenantId),
  })
}

export function useMenuProducts(tenantId: string) {
  return useQuery({
    queryKey: menuKeys.products(tenantId),
    queryFn: () => menuApi.getProducts(tenantId),
    staleTime: STALE_TIME,
    retry: 1,
    enabled: Boolean(tenantId),
  })
}

export function useMenuCategories(tenantId: string) {
  return useQuery({
    queryKey: menuKeys.categories(tenantId),
    queryFn: () => menuApi.getCategories(tenantId),
    staleTime: STALE_TIME,
    retry: 1,
    enabled: Boolean(tenantId),
  })
}

export function useCreateMenuOrder(tenantId: string) {
  return useMutation({
    mutationFn: (payload: ICreateMenuOrderPayload) =>
      menuApi.createOrder(tenantId, payload),
  })
}
