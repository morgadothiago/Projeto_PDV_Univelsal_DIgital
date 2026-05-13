import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { ICategory, IProduct, IProductFilters, IProductList } from '../interfaces/product.interface'

export const productApi = {
  findAll: async (filters?: IProductFilters): Promise<IProductList> => {
    const params: Record<string, string | number> = {}
    if (filters?.search) params.search = filters.search
    if (filters?.categoryId) params.categoryId = filters.categoryId
    if (filters?.page) params.page = filters.page
    if (filters?.limit) params.limit = filters.limit
    const res = await api.get<ApiResponse<IProduct[]>>('/products', { params })
    return {
      items: res.data.data,
      meta: res.data.meta ?? { page: 1, total: res.data.data.length, limit: 50 },
    }
  },

  findCategories: async (): Promise<ICategory[]> => {
    const res = await api.get<ApiResponse<ICategory[]>>('/categories')
    return res.data.data
  },
}
