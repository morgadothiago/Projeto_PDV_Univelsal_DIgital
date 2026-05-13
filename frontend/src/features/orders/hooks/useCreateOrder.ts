'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { orderApi } from '../api/order.api'
import { useOrderStore } from '../store/order.store'
import { useCartStore } from '../store/cart.store'
import type { ICreateOrder } from '../interfaces/order.interface'

export function useCreateOrder() {
  const router = useRouter()
  const setLastOrder = useOrderStore((s) => s.setLastOrder)
  const cartItems = useCartStore((s) => s.items)

  const mutation = useMutation({
    mutationFn: (dto: ICreateOrder) => orderApi.create(dto),
    onSuccess: (order) => {
      // Enrich order items with cart data (name/price not returned by all backends)
      const enriched = {
        ...order,
        items: order.items.length
          ? order.items
          : cartItems.map((i) => ({
              productId: i.productId,
              name: i.name,
              quantity: i.quantity,
              price: i.price,
            })),
      }
      setLastOrder(enriched)

      if (order.pixQrCode) {
        // Caller handles PIX QR modal before navigating
        return
      }
      router.push('/recibo')
    },
  })

  return mutation
}
