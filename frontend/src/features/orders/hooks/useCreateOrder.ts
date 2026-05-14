'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { orderApi } from '../api/order.api'
import { useOrderStore } from '../store/order.store'
import { useCartStore } from '../store/cart.store'
import type { ICreateOrder } from '../interfaces/order.interface'

async function confirmCashWithRetry(orderId: string): Promise<void> {
  try {
    await orderApi.confirmCash(orderId)
  } catch (err) {
    // Retry once after 1s only for network errors, not 4xx client errors
    const is4xx = axios.isAxiosError(err) && err.response && err.response.status >= 400 && err.response.status < 500
    if (is4xx) throw err
    await new Promise<void>((resolve) => setTimeout(resolve, 1000))
    await orderApi.confirmCash(orderId)
  }
}

export function useCreateOrder() {
  const router = useRouter()
  const setLastOrder = useOrderStore((s) => s.setLastOrder)
  const cartItems = useCartStore((s) => s.items)

  const mutation = useMutation({
    mutationFn: async (dto: ICreateOrder) => {
      const order = await orderApi.create(dto)
      if (dto.paymentMethod !== 'pix') {
        await confirmCashWithRetry(order.orderId)
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
    onError: (err) => {
      toast.error(getApiErrorMessage(err))
    },
  })

  return mutation
}
