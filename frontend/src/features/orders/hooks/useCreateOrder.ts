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
    mutationFn: async (dto: ICreateOrder) => {
      const order = await orderApi.create(dto)
      if (dto.paymentMethod !== 'pix') {
        await orderApi.confirmCash(order.orderId)
      }
      return order
    },
    onSuccess: (order) => {
      const enriched = {
        orderId: order.orderId,
        total: order.total,
        paymentMethod: order.payment.method,
        pixQrCode: order.payment.pixQrCode ?? undefined,
        items: cartItems.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        createdAt: new Date().toISOString(),
      }
      setLastOrder(enriched)

      if (order.payment.pixQrCode) {
        return
      }
      router.push('/recibo')
    },
  })

  return mutation
}
