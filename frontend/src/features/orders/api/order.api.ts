import { api } from '@/lib/axios'
import type { ICreateOrder, ICreateOrderResponse, IOrder, IOrderListResponse } from '../interfaces/order.interface'
import type { ApiResponse } from '@/types/api.types'

const PAYMENT_METHOD_MAP: Record<string, string> = {
  card: 'credit_card',
  pix: 'pix',
  cash: 'cash',
}

export const orderApi = {
  create: (dto: ICreateOrder): Promise<ICreateOrderResponse> =>
    api
      .post<ApiResponse<ICreateOrderResponse>>('/orders', {
        ...dto,
        paymentMethod: PAYMENT_METHOD_MAP[dto.paymentMethod] ?? dto.paymentMethod,
      })
      .then((r) => r.data.data),

  confirmCash: (id: string): Promise<IOrder> =>
    api.patch<ApiResponse<IOrder>>(`/orders/${id}/confirm-cash`).then((r) => r.data.data),

  cancel: (id: string): Promise<IOrder> =>
    api.patch<ApiResponse<IOrder>>(`/orders/${id}/cancel`).then((r) => r.data.data),

  findOne: (id: string): Promise<IOrder> =>
    api.get<ApiResponse<IOrder>>(`/orders/${id}`).then((r) => r.data.data),

  findAll: (params: { page?: number; limit?: number }): Promise<IOrderListResponse> =>
    api
      .get<ApiResponse<IOrderListResponse>>('/orders', { params })
      .then((r) => r.data.data),
}
