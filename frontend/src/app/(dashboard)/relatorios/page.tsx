'use client'

import { useState, useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { reportsApi } from '@/features/reports/api/reports.api'
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar'
import { usePlanUsage } from '@/features/billing/hooks/usePlanUsage'
import { UpgradeWall } from '@/features/billing/components/UpgradeWall'

type FilterPeriod = 'today' | '7d' | '30d'

interface FilterOption {
  id: FilterPeriod
  label: string
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'today', label: 'Hoje' },
  { id: '7d',    label: '7 dias' },
  { id: '30d',   label: '30 dias' },
]

const BADGE_BG: Record<number, string> = {
  0: '#2563EB',
  1: '#64748B',
  2: '#94A3B8',
}

function formatCurrency(v: number): string {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatDateLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getDateRange(filter: FilterPeriod): { dateFrom: string; dateTo: string } {
  const now = new Date()
  const today = formatDateLocal(now)
  if (filter === 'today') {
    return { dateFrom: today, dateTo: today }
  }
  if (filter === '7d') {
    const from = new Date(now)
    from.setDate(from.getDate() - 6)
    return { dateFrom: formatDateLocal(from), dateTo: today }
  }
  const from = new Date(now)
  from.setDate(from.getDate() - 29)
  return { dateFrom: formatDateLocal(from), dateTo: today }
}

export default function RelatoriosPage() {
  const { data: usage } = usePlanUsage()
  const [filter, setFilter] = useState<FilterPeriod>('today')

  const { dateFrom, dateTo } = useMemo(() => getDateRange(filter), [filter])

  const { data: salesData, isLoading: salesLoading, isError: salesError, refetch: refetchSales } = useQuery({
    queryKey: ['reports/sales', filter],
    queryFn: () => reportsApi.getSales({ groupBy: 'day', dateFrom, dateTo }),
  })

  const { data: topProducts = [], isLoading: topLoading } = useQuery({
    queryKey: ['reports/top-products', filter],
    queryFn: () => reportsApi.getTopProducts({ dateFrom, dateTo, limit: 3 }),
  })

  const summary = salesData?.summary
  const byDay = salesData?.byDay ?? []

  const todayStr = formatDateLocal(new Date())
  const chartData = byDay.map((d) => ({
    label: d.date.slice(5).replace('-', '/'),
    total: d.total,
    isToday: d.date === todayStr,
  }))

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      <DashboardSidebar />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header

          className="flex items-center bg-white flex-shrink-0"
          style={{ height: '62px', padding: '0 16px', borderBottom: '1px solid #E2E8F0' }}
        >
          <span className="font-bold" style={{ fontSize: '18px', color: '#0F172A' }}>
            Relatórios
          </span>
        </header>

        {/* Upgrade wall for free plan */}
        {usage && usage.plan === 'free' && (
          <UpgradeWall
            feature="Relatórios"
            description="Análise de vendas, top produtos e faturamento por período estão disponíveis apenas no plano Pro."
          />
        )}

        {/* Content */}
        {(!usage || usage.plan === 'pro') && (
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#F8FAFC' }}>
          {salesError && (
            <div className="flex flex-col items-center justify-center" style={{ paddingTop: '60px', gap: '12px' }}>
              <p style={{ fontSize: '14px', color: '#64748B' }}>Erro ao carregar relatórios.</p>
              <button
                onClick={() => refetchSales()}
                style={{
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Tentar novamente
              </button>
            </div>
          )}
          {!salesError && (
          <div className="flex flex-col" style={{ gap: '14px', padding: '16px' }}>
            {/* Filter pills */}
            <div className="flex" style={{ gap: '8px' }}>
              {FILTER_OPTIONS.map((opt) => {
                const isActive = filter === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setFilter(opt.id)}
                    className="font-semibold border"
                    style={{
                      height: '36px',
                      padding: '0 16px',
                      borderRadius: '18px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      backgroundColor: isActive ? '#2563EB' : '#FFFFFF',
                      borderColor: isActive ? '#2563EB' : '#E2E8F0',
                      color: isActive ? '#FFFFFF' : '#64748B',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2" style={{ gap: '10px' }}>
              {/* Revenue */}
              <div
                className="flex flex-col bg-white border rounded-[12px]"
                style={{ padding: '14px', borderColor: '#E2E8F0', gap: '4px' }}
              >
                <span style={{ fontSize: '11px', color: '#64748B' }}>Total faturado</span>
                {salesLoading ? (
                  <div className="animate-pulse rounded" style={{ width: '80%', height: '24px', backgroundColor: '#E2E8F0' }} />
                ) : (
                  <span className="font-bold" style={{ fontSize: '18px', color: '#0F172A' }}>
                    {formatCurrency(summary?.totalRevenue ?? 0)}
                  </span>
                )}
                {!salesLoading && summary && (
                  <div className="flex items-center" style={{ gap: '4px' }}>
                    <TrendingUp size={12} style={{ color: '#16A34A' }} />
                    <span className="font-semibold" style={{ fontSize: '11px', color: '#16A34A' }}>
                      +{summary.revenueDelta ?? 0}%
                    </span>
                  </div>
                )}
              </div>

              {/* Orders */}
              <div
                className="flex flex-col bg-white border rounded-[12px]"
                style={{ padding: '14px', borderColor: '#E2E8F0', gap: '4px' }}
              >
                <span style={{ fontSize: '11px', color: '#64748B' }}>Total de ordens</span>
                {salesLoading ? (
                  <div className="animate-pulse rounded" style={{ width: '60%', height: '24px', backgroundColor: '#E2E8F0' }} />
                ) : (
                  <span className="font-bold" style={{ fontSize: '18px', color: '#0F172A' }}>
                    {summary?.totalOrders ?? 0}
                  </span>
                )}
                {!salesLoading && summary && (
                  <div className="flex items-center" style={{ gap: '4px' }}>
                    <TrendingUp size={12} style={{ color: '#16A34A' }} />
                    <span className="font-semibold" style={{ fontSize: '11px', color: '#16A34A' }}>
                      +{summary.ordersDelta ?? 0}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bar chart card */}
            <div
              className="flex flex-col bg-white border rounded-[12px]"
              style={{ padding: '14px', borderColor: '#E2E8F0', gap: '12px' }}
            >
              <span className="font-bold" style={{ fontSize: '13px', color: '#0F172A' }}>
                Faturamento por dia
              </span>
              {salesLoading ? (
                <div className="animate-pulse rounded" style={{ height: '90px', backgroundColor: '#E2E8F0' }} />
              ) : chartData.length === 0 ? (
                <div
                  className="flex items-center justify-center"
                  style={{ height: '90px' }}
                >
                  <span style={{ fontSize: '13px', color: '#94A3B8' }}>Sem dados</span>
                </div>
              ) : (
                <div style={{ height: '90px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={24}>
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748B' }}
                      />
                      <YAxis hide />
                      <Tooltip
                        formatter={(value) => [
                          formatCurrency(typeof value === 'number' ? value : 0),
                          'Faturamento',
                        ]}
                        contentStyle={{ fontSize: '12px' }}
                      />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.isToday ? '#2563EB' : '#BFDBFE'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top products card */}
            <div
              className="flex flex-col bg-white border rounded-[12px]"
              style={{ padding: '14px', borderColor: '#E2E8F0', gap: '10px' }}
            >
              <span className="font-bold" style={{ fontSize: '13px', color: '#0F172A' }}>
                Top Produtos
              </span>

              {/* Header row */}
              <div
                className="flex items-center"
                style={{ paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}
              >
                <span className="flex-1 font-semibold" style={{ fontSize: '11px', color: '#64748B' }}>
                  Produto
                </span>
                <span className="font-semibold" style={{ fontSize: '11px', color: '#64748B' }}>
                  Qtd
                </span>
              </div>

              {/* Products */}
              {topLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded" style={{ height: '24px', backgroundColor: '#E2E8F0' }} />
                ))
              ) : topProducts.length === 0 ? (
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>Sem dados</span>
              ) : (
                topProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center" style={{ gap: '10px' }}>
                    <div
                      className="flex items-center justify-center flex-shrink-0 font-bold"
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '10px',
                        backgroundColor: BADGE_BG[index] ?? '#94A3B8',
                        color: '#FFFFFF',
                        fontSize: '11px',
                      }}
                    >
                      {index + 1}
                    </div>
                    <span className="flex-1" style={{ fontSize: '13px', color: '#0F172A' }}>
                      {product.name}
                    </span>
                    <span className="font-bold" style={{ fontSize: '13px', color: '#0F172A' }}>
                      {product.quantity}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}
