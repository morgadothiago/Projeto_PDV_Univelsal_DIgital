'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Share2, ChevronRight } from 'lucide-react'
import { useMenuTenant } from '@/features/menu/hooks/useMenu'

interface StoredOrder {
  id: string
  orderNumber: string
  total: number
  status: string
  estimatedMinutes: number
  tenantName: string
}

type TimelineStatus = 'done' | 'active' | 'pending'

function TimelineStep({
  label,
  status,
  primaryColor,
}: {
  label: string
  status: TimelineStatus
  primaryColor: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold"
        style={
          status === 'done'
            ? { backgroundColor: primaryColor, color: '#fff' }
            : status === 'active'
              ? { backgroundColor: '#FEF9C3', color: '#CA8A04', border: '2px solid #FDE047' }
              : { backgroundColor: '#F1F5F9', color: '#CBD5E1' }
        }
      >
        {status === 'done' ? '✓' : status === 'active' ? '●' : '○'}
      </div>
      <span
        className="text-sm font-medium"
        style={
          status === 'done'
            ? { color: primaryColor }
            : status === 'active'
              ? { color: '#CA8A04' }
              : { color: '#94A3B8' }
        }
      >
        {label}
      </span>
    </div>
  )
}

export default function ConfirmadoPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = use(params)

  const { data: tenant } = useMenuTenant(tenantId)
  const primaryColor = tenant?.settings?.primaryColor ?? '#EA580C'

  const [order, setOrder] = useState<StoredOrder | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(`pdv-order-${tenantId}`)
    if (stored) {
      try {
        setOrder(JSON.parse(stored) as StoredOrder)
      } catch {
        // ignore parse errors
      }
    }
  }, [tenantId])

  function handleShare() {
    if (!order) return
    const text = `Meu pedido #${order.orderNumber} em ${order.tenantName || 'PDV Universal'}! Total: ${order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
    if (navigator.share) {
      navigator
        .share({ title: 'Meu pedido', text })
        .catch(() => undefined)
    } else {
      navigator.clipboard.writeText(text).catch(() => undefined)
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center bg-slate-50 px-4 py-8"
      style={{ '--pdv-primary': primaryColor } as React.CSSProperties}
    >
      <div className="w-full max-w-[500px] space-y-6">
        {/* Success icon */}
        <div className="flex flex-col items-center text-center pt-4">
          <CheckCircle2
            size={72}
            strokeWidth={1.5}
            style={{ color: primaryColor }}
            aria-hidden
          />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Pedido confirmado!</h1>
          <p className="mt-2 text-slate-500 text-sm">
            {tenant?.name ?? 'O restaurante'} recebeu seu pedido
          </p>
        </div>

        {/* Order number card */}
        {order && (
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Número do pedido
            </p>
            <p
              className="mt-1 text-4xl font-black tracking-wide"
              style={{ color: primaryColor }}
              aria-label={`Número do pedido ${order.orderNumber}`}
            >
              #{order.orderNumber}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Total:{' '}
              <span className="font-semibold text-slate-800">
                {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </p>
            {order.estimatedMinutes > 0 && (
              <p className="mt-1 text-xs text-slate-400">
                Tempo estimado: ~{order.estimatedMinutes} minutos
              </p>
            )}
          </div>
        )}

        {/* Status timeline */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-4">
          <h2 className="font-semibold text-slate-800">Acompanhe seu pedido</h2>
          <div className="space-y-3">
            <TimelineStep label="Recebido" status="done" primaryColor={primaryColor} />
            <div className="ml-3.5 w-px h-3 bg-slate-200" />
            <TimelineStep label="Em preparação" status="active" primaryColor={primaryColor} />
            <div className="ml-3.5 w-px h-3 bg-slate-200" />
            <TimelineStep label="Pronto para retirada" status="pending" primaryColor={primaryColor} />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            O status é atualizado pela loja. Aguarde o aviso.
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 pb-8">
          <button
            type="button"
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-3.5 text-sm font-semibold transition-colors min-h-[44px]"
            style={{ borderColor: primaryColor, color: primaryColor }}
            aria-label="Compartilhar número do pedido"
          >
            <Share2 size={16} />
            Compartilhar pedido
          </button>

          <Link
            href={`/cardapio/${tenantId}`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 min-h-[44px]"
            style={{ backgroundColor: primaryColor }}
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem(`pdv-order-${tenantId}`)
              }
            }}
          >
            Fazer novo pedido
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
