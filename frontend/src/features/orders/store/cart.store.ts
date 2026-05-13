import { create } from 'zustand'
import type { IProduct } from '@/features/products/interfaces/product.interface'

export interface CartItem {
  productId: string
  name: string
  price: number
  unitType: string
  quantity: number
  stock: number
  stockEnabled: boolean
}

interface CartStore {
  items: CartItem[]
  paymentMethod: 'pix' | 'cash' | 'card' | null
  addItem: (product: IProduct) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  setPaymentMethod: (method: CartStore['paymentMethod']) => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  paymentMethod: null,

  addItem: (product) => {
    const { items } = get()
    const existing = items.find((i) => i.productId === product.id)
    if (existing) {
      set({
        items: items.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      })
    } else {
      set({
        items: [
          ...items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            unitType: product.unitType,
            quantity: 1,
            stock: product.stock,
            stockEnabled: true,
          },
        ],
      })
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.productId !== productId) })
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set({
      items: get().items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      ),
    })
  },

  clearCart: () => set({ items: [], paymentMethod: null }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),
}))

export const selectTotal = (state: CartStore) =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

export const selectItemCount = (state: CartStore) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0)
