'use client'

import { Sidebar } from '@/components/shared/Sidebar'
import { useOrders } from '@/features/orders/hooks/useOrders'
import type { IOrder } from '@/features/orders/interfaces/order.interface'
import { QrCode, Banknote, CreditCard } from 'lucide-react'

const TODAY = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function shortId(id: string): string {
  return '#' + id.slice(-6).toUpperCase()
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { label: string; className: string }> = {
    confirmed: {
      label: 'Confirmado',
      className: 'bg-green-100 text-green-700',
    },
    pending: {
      label: 'Pendente',
      className: 'bg-yellow-100 text-yellow-700',
    },
    cancelled: {
      label: 'Cancelado',
      className: 'bg-red-100 text-red-700',
    },
  }
  const config = (status ? map[status] : undefined) ?? { label: status ?? 'Desconhecido', className: 'bg-slate-100 text-slate-600' }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}

function PaymentIcon({ method }: { method: string }) {
  if (method === 'pix') return <QrCode size={16} className="text-[#64748B]" aria-hidden />
  if (method === 'cash') return <Banknote size={16} className="text-[#64748B]" aria-hidden />
  return <CreditCard size={16} className="text-[#64748B]" aria-hidden />
}

function OrderCard({ order }: { order: IOrder }) {
  return (
    <div
      className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-4 py-[14px]"
      style={{ padding: '14px 16px' }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#0F172A]">{shortId(order.orderId)}</span>
          <StatusBadge status={order.status} />
        </div>
        <span className="text-xs text-[#64748B]">{formatTime(order.createdAt)}</span>
      </div>
      <div className="flex items-center gap-3">
        <PaymentIcon method={order.paymentMethod} />
        <span className="text-sm font-bold text-[#0F172A]">{formatCurrency(order.total)}</span>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white px-4 py-[14px] animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="h-3 w-16 rounded bg-slate-100" />
      </div>
      <div className="h-4 w-20 rounded bg-slate-200" />
    </div>
  )
}

export default function HistoricoPage() {
  const { data, isLoading, isError } = useOrders({ page: 1, limit: 20 })

  const orders: IOrder[] = data?.data ?? []

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <div className="flex h-[62px] flex-shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-6">
          <div>
            <h1 className="text-[18px] font-bold text-[#0F172A]">Histórico de Vendas</h1>
            <p className="text-xs text-[#64748B] capitalize">{TODAY}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-[#64748B]">Erro ao carregar pedidos. Tente novamente.</p>
            </div>
          )}

          {!isLoading && !isError && orders.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-[#64748B]">Nenhuma venda hoje.</p>
            </div>
          )}

          {!isLoading && !isError && orders.length > 0 && (
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <OrderCard key={order.orderId} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
