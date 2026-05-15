import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { IProduct } from '../interfaces/product.interface'
import { mapProduct, type BackendProduct } from './product.api'

export interface ICreateProductDto {
  name: string
  price: number
  categoryId?: string
  unitType: 'unit' | 'weight' | 'digital'
  initialStock?: number
  stockThreshold?: number
  isActive?: boolean
  customUnit?: string
  imageUrl?: string
}

export interface IUpdateProductDto extends Partial<ICreateProductDto> {}

export const productCrudApi = {
  findById: async (id: string): Promise<IProduct> => {
    const res = await api.get<ApiResponse<BackendProduct>>(`/products/${id}`)
    return mapProduct(res.data.data)
  },

  create: async (dto: ICreateProductDto): Promise<IProduct> => {
    const res = await api.post<ApiResponse<BackendProduct>>('/products', dto)
    return mapProduct(res.data.data)
  },

  update: async (id: string, dto: IUpdateProductDto): Promise<IProduct> => {
    const res = await api.patch<ApiResponse<BackendProduct>>(`/products/${id}`, dto)
    return mapProduct(res.data.data)
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`)
  },

  createCategory: async (name: string): Promise<{ id: string; name: string }> => {
    const res = await api.post<ApiResponse<{ id: string; name: string }>>('/categories', { name })
    return res.data.data
  },
}
