'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CircleX, Ban } from 'lucide-react'
import { useCartStore } from '@/features/orders/store/cart.store'

export default function VendaCanceladaPage() {
  const router = useRouter()
  const clearCart = useCartStore((s) => s.clearCart)
  const [reason, setReason] = useState('')

  function handleNovaVenda() {
    clearCart()
    router.push('/pdv')
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <header
        className="flex items-center justify-center bg-white flex-shrink-0"
        style={{ height: '62px', borderBottom: '1px solid #E2E8F0' }}
      >
        <span className="font-bold" style={{ fontSize: '17px', color: '#0F172A' }}>
          Venda Cancelada
        </span>
      </header>

      {/* Body */}
      <div
        className="flex flex-col flex-1 items-center justify-center"
        style={{ gap: '24px', padding: '40px 24px' }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center"
          style={{ width: '96px', height: '96px', borderRadius: '48px', backgroundColor: '#FEF2F2' }}
        >
          <CircleX size={44} style={{ color: '#DC2626' }} />
        </div>

        {/* Title + order */}
        <div className="flex flex-col items-center" style={{ gap: '8px' }}>
          <span className="font-bold text-center" style={{ fontSize: '22px', color: '#0F172A' }}>
            Venda Cancelada
          </span>
          <span className="text-center" style={{ fontSize: '14px', color: '#64748B' }}>
            Pedido cancelado
          </span>
        </div>

        {/* Stamp badge */}
        <div
          className="flex items-center justify-center border"
          style={{
            height: '48px',
            padding: '0 16px',
            borderRadius: '8px',
            backgroundColor: '#FEF2F2',
            borderColor: '#FCA5A5',
            borderWidth: '1.5px',
            gap: '8px',
          }}
        >
          <Ban size={18} style={{ color: '#DC2626' }} />
          <span
            className="font-bold"
            style={{ fontSize: '14px', color: '#DC2626', letterSpacing: '1.5px' }}
          >
            CANCELADO
          </span>
        </div>

        {/* Reason */}
        <div className="flex flex-col w-full" style={{ gap: '6px', maxWidth: '400px' }}>
          <span className="font-semibold" style={{ fontSize: '13px', color: '#0F172A' }}>
            Motivo (opcional)
          </span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Descreva o motivo do cancelamento..."
            className="border outline-none resize-none"
            style={{
              height: '80px',
              padding: '12px',
              borderRadius: '10px',
              borderColor: '#E2E8F0',
              fontSize: '13px',
              color: '#0F172A',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '0 20px 40px' }}>
        <button
          onClick={handleNovaVenda}
          className="font-bold w-full"
          style={{
            height: '52px',
            borderRadius: '12px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            fontSize: '15px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Nova Venda
        </button>
      </div>
    </div>
  )
}
