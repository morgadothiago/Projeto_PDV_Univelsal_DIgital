'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { getSocket, disconnectSocket } from '@/lib/socket'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useNotificationStore } from '../store/notificationStore'

function playDing() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.6)
  } catch {
    // AudioContext blocked (requires user gesture) — silently ignore
  }
}

export function useOrderNotifications() {
  const token = useAuthStore((s) => s.token)
  const role = useAuthStore((s) => s.user?.role)
  const increment = useNotificationStore((s) => s.increment)
  const connected = useRef(false)

  useEffect(() => {
    // Only store_owner gets order notifications
    if (!token || role !== 'store_owner') return

    const socket = getSocket(token)
    connected.current = true

    function handleNewOrder(payload: { orderId: string; total: number; cashierName: string }) {
      increment()
      playDing()
      const label = payload.cashierName === 'Cardápio Digital' ? '🍽 Cardápio Digital' : payload.cashierName
      toast.info(`Novo pedido — ${label}`, {
        description: `R$ ${payload.total.toFixed(2).replace('.', ',')}`,
        duration: 6000,
      })
    }

    socket.on('order:created', handleNewOrder)

    return () => {
      socket.off('order:created', handleNewOrder)
      if (connected.current) {
        disconnectSocket()
        connected.current = false
      }
    }
  }, [token, role, increment])
}
