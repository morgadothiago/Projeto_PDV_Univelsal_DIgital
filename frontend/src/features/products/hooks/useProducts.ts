'use client'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '../api/product.api'
import type { IProductFilters } from '../interfaces/product.interface'

export function useProducts(filters?: IProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.findAll(filters),
    staleTime: 1000 * 60 * 2,
  })
}
