'use client'
import { useQuery } from '@tanstack/react-query'
import { productApi } from '../api/product.api'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productApi.findCategories(),
    staleTime: 1000 * 60 * 10,
  })
}
