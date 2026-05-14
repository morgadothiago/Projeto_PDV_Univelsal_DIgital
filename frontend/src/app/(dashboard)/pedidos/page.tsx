'use client'

import { useState } from 'react'
import { QrCode, Banknote, CreditCard } from 'lucide-react'
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar'
import { useOrders } from '@/features/orders/hooks/useOrders'
import type { IOrderListItem } from '@/features/orders/interfaces/order.interface'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    confirmed:  { label: 'Confirmado', bg: '#DCFCE7', color: '#16A34A' },
    completed:  { label: 'Concluído',  bg: '#DCFCE7', color: '#16A34A' },
    pending:    { label: 'Pendente',   bg: '#FEF9C3', color: '#CA8A04' },
    cancelled:  { label: 'Cancelado',  bg: '#FEE2E2', color: '#DC2626' },
  }
  const cfg = (status ? map[status] : undefined) ?? {
    label: status ?? 'Desconhecido',
    bg: '#F1F5F9',
    color: '#64748B',
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

function PaymentIcon({ method }: { method: string }) {
  if (method === 'pix' || method === 'PIX') return <QrCode size={16} style={{ color: '#64748B' }} aria-hidden />
  if (method === 'cash') return <Banknote size={16} style={{ color: '#64748B' }} aria-hidden />
  return <CreditCard size={16} style={{ color: '#64748B' }} aria-hidden />
}

function PaymentLabel({ method }: { method: string }) {
  if (method === 'pix' || method === 'PIX') return 'PIX'
  if (method === 'cash') return 'Dinheiro'
  return 'Cartão'
}

function SkeletonCard() {
  return (
    <div
      className="animate-pulse rounded-xl border border-[#E2E8F0] bg-white"
      style={{ padding: '14px 16px' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-3 w-20 rounded bg-slate-100" />
        </div>
        <div className="h-4 w-20 rounded bg-slate-200" />
      </div>
    </div>
  )
}

function OrderRow({ order }: { order: IOrderListItem }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
      <div
        className="flex w-full items-center justify-between"
        style={{ padding: '14px 16px' }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#0F172A]">{shortId(order.id)}</span>
            <StatusBadge status={order.status} />
          </div>
          <span className="text-xs text-[#64748B]">{formatDate(order.createdAt)}</span>
          {order.itemCount > 0 && (
            <span className="text-xs text-[#94A3B8]">
              {order.itemCount} {order.itemCount === 1 ? 'item' : 'itens'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <PaymentIcon method={order.paymentMethod} />
            <span className="text-xs text-[#64748B]">
              <PaymentLabel method={order.paymentMethod} />
            </span>
          </div>
          <span className="text-sm font-bold text-[#0F172A] w-20 text-right">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Date filter ─────────────────────────────────────────────────────────────

type DateFilter = 'today' | '7days' | 'all'

const DATE_FILTERS: { id: DateFilter; label: string }[] = [
  { id: 'today',  label: 'Hoje' },
  { id: '7days',  label: 'Últimos 7 dias' },
  { id: 'all',    label: 'Todos' },
]

function filterOrders(orders: IOrderListItem[], filter: DateFilter): IOrderListItem[] {
  const now = new Date()
  if (filter === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return orders.filter((o) => new Date(o.createdAt) >= start)
  }
  if (filter === '7days') {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return orders.filter((o) => new Date(o.createdAt) >= start)
  }
  return orders
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PedidosPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('today')
  const { data, isLoading, isError } = useOrders({ page: 1, limit: 50 })

  const allOrders: IOrderListItem[] = data?.data ?? []
  const orders = filterOrders(allOrders, dateFilter)

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      <DashboardSidebar />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <div
          className="flex items-center justify-between bg-white flex-shrink-0"
          style={{ height: '62px', padding: '0 24px', borderBottom: '1px solid #E2E8F0' }}
        >
          <div>
            <h1 className="font-bold" style={{ fontSize: '18px', color: '#0F172A' }}>
              Histórico de Pedidos
            </h1>
            <p style={{ fontSize: '12px', color: '#64748B' }}>
              {isLoading ? 'Carregando...' : `${orders.length} pedido${orders.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Date filter pills */}
          <div className="flex gap-2">
            {DATE_FILTERS.map(({ id, label }) => {
              const active = dateFilter === id
              return (
                <button
                  key={id}
                  onClick={() => setDateFilter(id)}
                  className="font-medium"
                  style={{
                    height: '32px',
                    padding: '0 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    border: active ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    backgroundColor: active ? '#EFF6FF' : '#FFFFFF',
                    color: active ? '#2563EB' : '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '20px 24px' }}>
          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center py-20">
              <p style={{ fontSize: '14px', color: '#64748B' }}>
                Erro ao carregar pedidos. Tente novamente.
              </p>
            </div>
          )}

          {!isLoading && !isError && orders.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <p style={{ fontSize: '14px', color: '#64748B' }}>
                Nenhum pedido encontrado para o período selecionado.
              </p>
            </div>
          )}

          {!isLoading && !isError && orders.length > 0 && (
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
