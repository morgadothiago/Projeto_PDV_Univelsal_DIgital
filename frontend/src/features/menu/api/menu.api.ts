import axios from 'axios'
import type { IProduct, ICategory } from '@/features/products/interfaces/product.interface'
import type { ApiResponse } from '@/types/api.types'

const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',
})

export const menuApi = {
  getProducts: async (tenantId: string): Promise<IProduct[]> => {
    const res = await publicApi.get<ApiResponse<{ items: IProduct[] }>>(
      `/menu/${tenantId}/products`,
    )
    return res.data.data.items
  },
  getCategories: async (tenantId: string): Promise<ICategory[]> => {
    const res = await publicApi.get<ApiResponse<ICategory[]>>(`/menu/${tenantId}/categories`)
    return res.data.data
  },
}
