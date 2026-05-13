import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { IProduct } from '../interfaces/product.interface'

export interface ICreateProductDto {
  name: string
  price: number
  categoryId?: string
  unitType: 'unit' | 'weight' | 'digital'
  stockThreshold?: number
  isActive?: boolean
  customUnit?: string
}

export interface IUpdateProductDto extends Partial<ICreateProductDto> {}

export const productCrudApi = {
  findById: async (id: string): Promise<IProduct> => {
    const res = await api.get<ApiResponse<IProduct>>(`/products/${id}`)
    return res.data.data
  },

  create: async (dto: ICreateProductDto): Promise<IProduct> => {
    const res = await api.post<ApiResponse<IProduct>>('/products', dto)
    return res.data.data
  },

  update: async (id: string, dto: IUpdateProductDto): Promise<IProduct> => {
    const res = await api.patch<ApiResponse<IProduct>>(`/products/${id}`, dto)
    return res.data.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`)
  },

  createCategory: async (name: string): Promise<{ id: string; name: string }> => {
    const res = await api.post<ApiResponse<{ id: string; name: string }>>('/categories', { name })
    return res.data.data
  },
}
