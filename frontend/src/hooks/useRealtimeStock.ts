'use client'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSocket } from '@/lib/socket'
import { useAuthStore } from '@/features/auth/store/auth.store'

export function useRealtimeStock() {
  const token = useAuthStore((s) => s.token)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!token) return

    const socket = getSocket(token)

    socket.on(
      'stock:updated',
      (data: { productId: string; newStock: number; productName: string }) => {
        queryClient.invalidateQueries({ queryKey: ['products'] })
        if (data.newStock <= 5 && data.newStock > 0) {
          toast.warning(`Estoque baixo: ${data.productName} (${data.newStock} restantes)`)
        }
        if (data.newStock === 0) {
          toast.error(`${data.productName} esgotado!`)
        }
      },
    )

    socket.on('order:created', (_data: { orderId: string; total: number }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    })

    return () => {
      socket.off('stock:updated')
      socket.off('order:created')
    }
  }, [token, queryClient])
}
