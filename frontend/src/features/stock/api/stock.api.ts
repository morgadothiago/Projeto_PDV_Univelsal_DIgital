import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { IProduct } from '@/features/products/interfaces/product.interface'

export interface IStockEntry {
  productId: string
  quantity: number
}

export interface IStockEntryResponse {
  id: string
  productId: string
  quantity: number
  createdAt: string
}

export const stockApi = {
  addEntry: async (dto: IStockEntry): Promise<IStockEntryResponse> => {
    const res = await api.post<ApiResponse<IStockEntryResponse>>('/stock/entry', dto)
    return res.data.data
  },

  getAlerts: async (): Promise<IProduct[]> => {
    const res = await api.get<ApiResponse<IProduct[]>>('/stock/alerts')
    return res.data.data
  },
}
