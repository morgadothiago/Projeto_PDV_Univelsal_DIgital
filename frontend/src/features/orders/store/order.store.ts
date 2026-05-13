import { create } from 'zustand'
import type { IOrder } from '../interfaces/order.interface'

interface OrderStore {
  lastOrder: IOrder | null
  setLastOrder: (order: IOrder) => void
  clearOrder: () => void
}

export const useOrderStore = create<OrderStore>((set) => ({
  lastOrder: null,
  setLastOrder: (order) => set({ lastOrder: order }),
  clearOrder: () => set({ lastOrder: null }),
}))
