import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { ICategory, IProduct, IProductFilters, IProductList } from '../interfaces/product.interface'

export interface BackendProduct {
  id: string
  name: string
  price: number
  unitType: string
  customUnit?: string | null
  imageUrl?: string | null
  stock: number
  stockThreshold: number
  isActive: boolean
  category: { id: string; name: string } | null
}

export function mapProduct(p: BackendProduct): IProduct {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    unitType: p.unitType,
    customUnit: p.customUnit ?? null,
    categoryId: p.category?.id ?? null,
    categoryName: p.category?.name ?? null,
    imageUrl: p.imageUrl ?? null,
    stock: p.stock,
    stockThreshold: p.stockThreshold,
    isActive: p.isActive,
  }
}

export const productApi = {
  findAll: async (filters?: IProductFilters): Promise<IProductList> => {
    const params: Record<string, string | number> = {}
    if (filters?.search) params.search = filters.search
    if (filters?.categoryId) params.categoryId = filters.categoryId
    if (filters?.page) params.page = filters.page
    if (filters?.limit) params.limit = filters.limit
    const res = await api.get<ApiResponse<BackendProduct[]>>('/products', { params })
    const raw = res.data.data
    return {
      items: raw.map(mapProduct),
      meta: res.data.meta ?? { page: 1, total: raw.length, limit: 50 },
    }
  },

  findCategories: async (): Promise<ICategory[]> => {
    const res = await api.get<ApiResponse<ICategory[]>>('/categories')
    return res.data.data
  },
}
