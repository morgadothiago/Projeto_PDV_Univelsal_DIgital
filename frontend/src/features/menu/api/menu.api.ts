import axios from 'axios'
import type { IProduct, ICategory } from '@/features/products/interfaces/product.interface'
import type { ApiResponse } from '@/types/api.types'
import type {
  IMenuTenant,
  ICreateMenuOrderPayload,
  IMenuOrderResult,
} from '@/features/menu/interfaces/menu.interface'

const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',
})

interface MenuBackendProduct {
  id: string
  name: string
  price: number
  unitType: string
  customUnit: string | null
  categoryId: string | null
  categoryName: string | null
  imageUrl: string | null
  stock: number
  active: boolean
}

export const menuApi = {
  getProducts: async (tenantId: string): Promise<IProduct[]> => {
    const res = await publicApi.get<ApiResponse<{ items: MenuBackendProduct[] }>>(
      `/menu/${tenantId}/products`,
    )
    return res.data.data.items.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      unitType: p.unitType,
      customUnit: p.customUnit,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      imageUrl: p.imageUrl,
      stock: p.stock,
      isActive: p.active,
    }))
  },
  getCategories: async (tenantId: string): Promise<ICategory[]> => {
    const res = await publicApi.get<ApiResponse<ICategory[]>>(`/menu/${tenantId}/categories`)
    return res.data.data
  },
  getTenantInfo: async (tenantId: string): Promise<IMenuTenant> => {
    const res = await publicApi.get<ApiResponse<IMenuTenant>>(`/menu/${tenantId}/info`)
    return res.data.data
  },
  createOrder: async (
    tenantId: string,
    payload: ICreateMenuOrderPayload,
  ): Promise<IMenuOrderResult> => {
    const res = await publicApi.post<ApiResponse<IMenuOrderResult>>(`/menu/${tenantId}/orders`, payload)
    return res.data.data
  },
}
