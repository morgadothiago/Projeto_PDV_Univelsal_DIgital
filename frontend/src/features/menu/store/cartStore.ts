import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ICartItem } from '@/features/menu/interfaces/menu.interface'

interface CartState {
  tenantId: string | null
  items: ICartItem[]
  orderNotes: string
  addItem: (item: ICartItem) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  updateItemNotes: (productId: string, notes: string) => void
  setOrderNotes: (notes: string) => void
  clearCart: () => void
  setTenantId: (id: string) => void
  total: () => number
  itemCount: () => number
}

export const useMenuCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      tenantId: null,
      items: [],
      orderNotes: '',

      addItem: (item) => {
        const { items } = get()
        const existing = items.find((i) => i.productId === item.productId)
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            ),
          })
        } else {
          set({ items: [...items, item] })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },

      updateQty: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity: qty } : i,
          ),
        })
      },

      updateItemNotes: (productId, notes) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, notes } : i,
          ),
        })
      },

      setOrderNotes: (notes) => set({ orderNotes: notes }),

      clearCart: () => set({ items: [], orderNotes: '' }),

      setTenantId: (id) => {
        const current = get().tenantId
        if (current !== null && current !== id) {
          // Different tenant — reset cart
          set({ tenantId: id, items: [], orderNotes: '' })
        } else {
          set({ tenantId: id })
        }
      },

      total: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'pdv-cart',
    },
  ),
)
