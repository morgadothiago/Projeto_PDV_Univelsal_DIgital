'use client'

import { Bell, ShoppingCart, ShoppingBag, DollarSign, Package, Users } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useKPIs, useWeeklyChart, useTopProducts } from '@/features/dashboard/hooks/useDashboard'
import { KPICardMobile } from '@/features/dashboard/components/KPICardMobile'
import { KPICardDesktop } from '@/features/dashboard/components/KPICardDesktop'
import { WeeklyBarChart } from '@/features/dashboard/components/WeeklyBarChart'
import { TopProductsList } from '@/features/dashboard/components/TopProductsList'
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar'
import { usePlanUsage } from '@/features/billing/hooks/usePlanUsage'
import { PlanUsageBar } from '@/features/billing/components/PlanUsageBar'
import Link from 'next/link'
import { Zap } from 'lucide-react'

function formatCurrency(v: number): string {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })
}

function getDateString(): string {
  const raw = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function KPISkeletonMobile() {
  return (
    <div
      className="flex flex-col bg-white rounded-[12px] border"
      style={{ borderColor: '#E2E8F0', padding: '14px', gap: '6px' }}
    >
      <div className="animate-pulse rounded-[8px]" style={{ width: '36px', height: '36px', backgroundColor: '#E2E8F0' }} />
      <div className="animate-pulse rounded" style={{ width: '70%', height: '22px', backgroundColor: '#E2E8F0' }} />
      <div className="animate-pulse rounded" style={{ width: '50%', height: '11px', backgroundColor: '#E2E8F0' }} />
    </div>
  )
}

function KPISkeletonDesktop() {
  return (
    <div
      className="flex flex-col bg-white rounded-[12px] border"
      style={{ borderColor: '#E2E8F0', padding: '20px', gap: '8px' }}
    >
      <div className="flex items-center justify-between">
        <div className="animate-pulse rounded" style={{ width: '60%', height: '13px', backgroundColor: '#E2E8F0' }} />
        <div className="animate-pulse rounded-[8px]" style={{ width: '36px', height: '36px', backgroundColor: '#E2E8F0' }} />
      </div>
      <div className="animate-pulse rounded" style={{ width: '50%', height: '32px', backgroundColor: '#E2E8F0' }} />
      <div className="animate-pulse rounded" style={{ width: '40%', height: '12px', backgroundColor: '#E2E8F0' }} />
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: kpis, isLoading: kpisLoading } = useKPIs()
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyChart()
  const { data: topProducts, isLoading: topLoading } = useTopProducts()
  const { data: usage } = usePlanUsage()

  const userName = user?.name?.split(' ')[0] ?? 'Usuário'
  const dateString = getDateString()
  const greeting = getGreeting()

  const kpiCards = [
    {
      icon: ShoppingBag,
      iconColor: '#2563EB',
      iconBg: '#EFF6FF',
      value: kpisLoading ? '—' : String(kpis?.salesToday ?? 0),
      label: 'Vendas hoje',
      delta: kpisLoading ? undefined : `+${kpis?.salesDelta ?? 0}%`,
      deltaPositive: true,
    },
    {
      icon: DollarSign,
      iconColor: '#16A34A',
      iconBg: '#F0FDF4',
      value: kpisLoading ? '—' : formatCurrency(kpis?.revenueToday ?? 0),
      label: 'Faturamento',
      delta: kpisLoading ? undefined : `+${kpis?.revenueDelta ?? 0}%`,
      deltaPositive: true,
    },
    {
      icon: Package,
      iconColor: '#9333EA',
      iconBg: '#FAF5FF',
      value: kpisLoading ? '—' : String(kpis?.activeProducts ?? 0),
      label: 'Produtos ativos',
      delta: undefined,
    },
    {
      icon: Users,
      iconColor: '#EA580C',
      iconBg: '#FFF7ED',
      value: kpisLoading ? '—' : String(kpis?.cashiersCount ?? 0),
      label: 'Caixeiros',
      delta: undefined,
    },
  ]

  return (
    <>
      {/* Mobile layout */}
      <div className="flex flex-col min-h-screen md:hidden" style={{ backgroundColor: '#F8FAFC' }}>
        <header
          className="flex items-center justify-between bg-white flex-shrink-0"
          style={{ height: '62px', padding: '0 20px', borderBottom: '1px solid #E2E8F0' }}
        >
          <div className="flex items-center" style={{ gap: '12px' }}>
            <div
              className="flex items-center justify-center"
              style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF' }}
            >
              <ShoppingCart size={16} style={{ color: '#2563EB' }} />
            </div>
            <span
              className="font-bold"
              style={{ fontSize: '17px', color: '#0F172A', fontFamily: 'Inter, sans-serif' }}
            >
              Dashboard
            </span>
          </div>
          <button
            className="flex items-center justify-center"
            style={{ width: '36px', height: '36px', borderRadius: '8px' }}
            aria-label="Notificações"
          >
            <Bell size={20} style={{ color: '#64748B' }} />
          </button>
        </header>

        <div
          className="flex flex-col overflow-y-auto pb-16"
          style={{ gap: '16px', padding: '20px 16px 24px' }}
        >
          <div className="flex flex-col" style={{ gap: '2px' }}>
            <span
              className="font-bold"
              style={{ fontSize: '16px', color: '#0F172A', fontFamily: 'Inter, sans-serif' }}
            >
              {greeting}, {userName}
            </span>
            <span style={{ fontSize: '13px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
              {dateString}
            </span>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '10px' }}>
            {kpisLoading
              ? Array.from({ length: 4 }).map((_, i) => <KPISkeletonMobile key={i} />)
              : kpiCards.map((card) => (
                  <KPICardMobile key={card.label} {...card} />
                ))}
          </div>

          <div
            className="flex flex-col bg-white rounded-[12px] border"
            style={{ borderColor: '#E2E8F0', padding: '16px', gap: '14px' }}
          >
            <div className="flex items-center justify-between">
              <span
                className="font-bold"
                style={{ fontSize: '14px', color: '#0F172A', fontFamily: 'Inter, sans-serif' }}
              >
                Vendas da Semana
              </span>
              <span style={{ fontSize: '12px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                últimos 7 dias
              </span>
            </div>
            <div style={{ height: '120px' }}>
              {weeklyLoading || !weeklyData ? (
                <div className="animate-pulse rounded w-full h-full" style={{ backgroundColor: '#E2E8F0' }} />
              ) : (
                <WeeklyBarChart data={weeklyData} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex h-screen" style={{ backgroundColor: '#F8FAFC' }}>
        <DashboardSidebar />

        <div className="flex flex-col flex-1 min-w-0">
          <header
            className="flex items-center justify-between bg-white flex-shrink-0"
            style={{ height: '64px', padding: '0 32px', borderBottom: '1px solid #E2E8F0' }}
          >
            <span
              className="font-bold"
              style={{ fontSize: '20px', color: '#0F172A', fontFamily: 'Inter, sans-serif' }}
            >
              Dashboard
            </span>
            <div className="flex items-center" style={{ gap: '12px' }}>
              <span style={{ fontSize: '13px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                {dateString}
              </span>
              <button
                className="flex items-center justify-center border"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  borderColor: '#E2E8F0',
                }}
                aria-label="Notificações"
              >
                <Bell size={16} style={{ color: '#64748B' }} />
              </button>
            </div>
          </header>

          <div
            className="flex flex-col overflow-y-auto"
            style={{ gap: '24px', padding: '28px 32px' }}
          >
            <div className="grid grid-cols-4" style={{ gap: '16px' }}>
              {kpisLoading
                ? Array.from({ length: 4 }).map((_, i) => <KPISkeletonDesktop key={i} />)
                : kpiCards.map((card) => (
                    <KPICardDesktop key={card.label} {...card} />
                  ))}
            </div>

            {usage && usage.plan === 'free' && (
              <div
                className="flex flex-col bg-white rounded-[12px] border"
                style={{ borderColor: '#E2E8F0', padding: '20px', gap: '16px' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold" style={{ fontSize: 14, color: '#0F172A' }}>
                      Plano Gratuito
                    </span>
                    <span style={{ fontSize: 12, color: '#64748B' }}>
                      Limites do seu plano atual
                    </span>
                  </div>
                  <Link
                    href="/configuracoes"
                    className="flex items-center gap-1.5 font-semibold"
                    style={{
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  >
                    <Zap size={14} />
                    Upgrade Pro — R$79/mês
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  <PlanUsageBar label="Produtos" current={usage.products.current} limit={usage.products.limit} />
                  <PlanUsageBar label="Caixeiros" current={usage.cashiers.current} limit={usage.cashiers.limit} />
                  <PlanUsageBar label="Pedidos este mês" current={usage.ordersThisMonth.current} limit={usage.ordersThisMonth.limit} />
                </div>
                <div
                  className="flex flex-col gap-1 rounded-lg"
                  style={{ backgroundColor: '#EFF6FF', padding: '12px 16px' }}
                >
                  <span className="font-semibold" style={{ fontSize: 13, color: '#1D4ED8' }}>
                    Pro desbloqueia:
                  </span>
                  <span style={{ fontSize: 12, color: '#3B82F6' }}>
                    Produtos e caixeiros ilimitados · Relatórios completos · Gestão de estoque · Personalização de cores e logo
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-stretch" style={{ gap: '16px', height: '300px' }}>
              <div
                className="flex flex-col flex-1 bg-white rounded-[12px] border"
                style={{ borderColor: '#E2E8F0', padding: '20px', gap: '16px' }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-bold"
                    style={{ fontSize: '15px', color: '#0F172A', fontFamily: 'Inter, sans-serif' }}
                  >
                    Vendas da Semana
                  </span>
                  <div
                    className="flex items-center border"
                    style={{
                      height: '32px',
                      padding: '0 14px',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      borderColor: '#E2E8F0',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                      Esta semana
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-h-0">
                  {weeklyLoading || !weeklyData ? (
                    <div className="animate-pulse rounded w-full h-full" style={{ backgroundColor: '#E2E8F0' }} />
                  ) : (
                    <WeeklyBarChart data={weeklyData} />
                  )}
                </div>
              </div>

              <div
                className="flex-shrink-0 bg-white rounded-[12px] border overflow-y-auto"
                style={{ width: '280px', borderColor: '#E2E8F0', padding: '20px' }}
              >
                {topLoading || !topProducts ? (
                  <div className="flex flex-col" style={{ gap: '12px' }}>
                    <div className="animate-pulse rounded" style={{ width: '60%', height: '15px', backgroundColor: '#E2E8F0' }} />
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse rounded" style={{ width: '100%', height: '38px', backgroundColor: '#E2E8F0' }} />
                    ))}
                  </div>
                ) : (
                  <TopProductsList products={topProducts} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
