'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Share2, ChevronRight } from 'lucide-react'
import { useMenuTenant } from '@/features/menu/hooks/useMenu'
import axios from 'axios'

const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',
})

interface StoredOrder {
  id: string
  orderNumber: string
  total: number
  status: string
  estimatedMinutes: number
  tenantName: string
  pixQrCode?: string | null
  pixQrCodeBase64?: string | null
  paymentMethod?: string
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

function CopyPixButton({ pixCode, primaryColor }: { pixCode: string; primaryColor: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(pixCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      style={{
        backgroundColor: primaryColor,
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 24px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        width: '100%',
      }}
    >
      {copied ? 'Copiado!' : 'Copiar código PIX'}
    </button>
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
  const [orderStatus, setOrderStatus] = useState<string>('pending')
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(`pdv-order-${tenantId}`)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredOrder
        setOrder(parsed)
        setOrderStatus(parsed.status ?? 'pending')
      } catch {
        // ignore parse errors
      }
    }
  }, [tenantId])

  // PIX payment status polling
  useEffect(() => {
    if (!order?.id || order.paymentMethod !== 'pix' || paymentConfirmed) return

    const interval = setInterval(async () => {
      try {
        const res = await publicApi.get(`/menu/${tenantId}/orders/${order.id}/status`)
        const data = res.data?.data ?? res.data
        setOrderStatus(data.status)
        if (data.paymentStatus === 'confirmed' || data.status === 'confirmed') {
          setPaymentConfirmed(true)
          clearInterval(interval)
        }
      } catch {
        // silently ignore
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [order, tenantId, paymentConfirmed])

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

  const isPix = order?.paymentMethod === 'pix'

  // Timeline step statuses
  const paymentStepStatus: TimelineStatus = paymentConfirmed
    ? 'done'
    : isPix
      ? 'active'
      : 'done'

  const receivedStepStatus: TimelineStatus = paymentConfirmed ? 'done' : isPix ? 'pending' : 'done'

  const preparingStepStatus: TimelineStatus = paymentConfirmed
    ? 'active'
    : isPix
      ? 'pending'
      : 'active'

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

        {/* PIX QR Code section */}
        {order && isPix && order.pixQrCode && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
              Pague com PIX
            </p>
            {paymentConfirmed ? (
              <p style={{ fontSize: '13px', color: '#16A34A', fontWeight: 600, margin: 0 }}>
                Pagamento confirmado!
              </p>
            ) : (
              <>
                <img
                  src={
                    order.pixQrCodeBase64
                      ? `data:image/png;base64,${order.pixQrCodeBase64}`
                      : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(order.pixQrCode)}`
                  }
                  alt="QR Code PIX"
                  style={{ width: 200, height: 200, borderRadius: 8 }}
                />
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    width: '100%',
                  }}
                >
                  <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 4px 0' }}>
                    PIX Copia e Cola
                  </p>
                  <p
                    style={{
                      fontSize: '11px',
                      color: '#0F172A',
                      margin: 0,
                      wordBreak: 'break-all',
                      lineHeight: 1.4,
                    }}
                  >
                    {order.pixQrCode}
                  </p>
                </div>
                <CopyPixButton pixCode={order.pixQrCode} primaryColor={primaryColor} />
              </>
            )}
          </div>
        )}

        {/* Status timeline */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-4">
          <h2 className="font-semibold text-slate-800">Acompanhe seu pedido</h2>
          <div className="space-y-3">
            {isPix && (
              <>
                <TimelineStep
                  label="Pagamento"
                  status={paymentStepStatus}
                  primaryColor={primaryColor}
                />
                <div className="ml-3.5 w-px h-3 bg-slate-200" />
              </>
            )}
            <TimelineStep label="Recebido" status={receivedStepStatus} primaryColor={primaryColor} />
            <div className="ml-3.5 w-px h-3 bg-slate-200" />
            <TimelineStep
              label="Em preparação"
              status={preparingStepStatus}
              primaryColor={primaryColor}
            />
            <div className="ml-3.5 w-px h-3 bg-slate-200" />
            <TimelineStep label="Pronto para retirada" status="pending" primaryColor={primaryColor} />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {isPix && !paymentConfirmed
              ? 'Aguardando confirmação do pagamento PIX...'
              : 'O status é atualizado pela loja. Aguarde o aviso.'}
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
