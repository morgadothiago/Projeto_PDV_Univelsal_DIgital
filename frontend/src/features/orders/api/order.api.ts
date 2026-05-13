import { api } from '@/lib/axios'
import type { ICreateOrder, IOrder } from '../interfaces/order.interface'

export const orderApi = {
  create: (dto: ICreateOrder): Promise<IOrder> =>
    api.post<IOrder>('/orders', dto).then((r) => r.data),
}
