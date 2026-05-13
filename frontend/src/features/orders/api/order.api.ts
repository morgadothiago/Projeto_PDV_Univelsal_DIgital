import { api } from '@/lib/axios'
import type { ICreateOrder, ICreateOrderResponse, IOrder } from '../interfaces/order.interface'

export const orderApi = {
  create: (dto: ICreateOrder): Promise<ICreateOrderResponse> =>
    api.post<ICreateOrderResponse>('/orders', dto).then((r) => r.data),

  confirmCash: (id: string): Promise<IOrder> =>
    api.patch<IOrder>(`/orders/${id}/confirm-cash`).then((r) => r.data),

  cancel: (id: string): Promise<IOrder> =>
    api.patch<IOrder>(`/orders/${id}/cancel`).then((r) => r.data),

  findOne: (id: string): Promise<IOrder> =>
    api.get<IOrder>(`/orders/${id}`).then((r) => r.data),
}
