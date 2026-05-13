'use client'

import { use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Ban,
  Pencil,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  TriangleAlert,
} from 'lucide-react'
import { AdminTopBar } from '@/features/admin/components/AdminTopBar'
import { PlanBadge } from '@/features/admin/components/PlanBadge'
import { StatusBadge } from '@/features/admin/components/StatusBadge'
import { useTenantDetail } from '@/features/admin/hooks/useTenantDetail'
import { TENANT_TYPE_LABELS } from '@/features/admin/interfaces/admin.interface'

interface PageProps {
  params: Promise<{ id: string }>
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function SkeletonBlock({ w = '80%', h = 16 }: { w?: string; h?: number }) {
  return (
    <div
      style={{
        width: w,
        height: `${h}px`,
        borderRadius: '4px',
        backgroundColor: '#F1F5F9',
      }}
    />
  )
}

const MOCK_ORDERS = [
  { id: '#2041', cashier: 'Maria Souza', total: 'R$ 127,50', status: 'active', date: '12/05/2026' },
  { id: '#2040', cashier: 'Carlos Lima', total: 'R$ 89,00', status: 'pending', date: '12/05/2026' },
  { id: '#2039', cashier: 'Ana Pereira', total: 'R$ 215,00', status: 'active', date: '11/05/2026' },
]

const MOCK_ALERTS = [
  { name: 'Farinha de Trigo', stock: '3 unidades', level: 'critical' },
  { name: 'Manteiga', stock: '7 unidades', level: 'low' },
  { name: 'Açúcar Refinado', stock: '12 unidades', level: 'low' },
]

export default function TenantDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { data: tenant, isLoading } = useTenantDetail(id)

  const initials = tenant ? getInitials(tenant.name) : '??'
  const tenantStatus = tenant?.isActive ? 'active' : 'suspended'

  const topBarLeft = (
    <>
      <Link href="/admin/lojas" className="flex items-center no-underline">
        <ArrowLeft size={16} color="#64748B" />
      </Link>
      <div className="flex flex-col" style={{ marginLeft: '8px' }}>
        {isLoading ? (
          <SkeletonBlock w="160px" h={18} />
        ) : (
          <span
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#0F172A',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {tenant?.name ?? 'Loja'}
          </span>
        )}
        <span
          style={{
            fontSize: '12px',
            color: '#64748B',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Lojas &gt; {tenant?.name ?? '...'}
        </span>
      </div>
    </>
  )

  const topBarRight = (
    <>
      <button
        type="button"
        className="flex items-center"
        style={{
          gap: '6px',
          backgroundColor: '#FFF1F2',
          border: '1px solid #FCA5A5',
          color: '#DC2626',
          fontSize: '13px',
          fontWeight: 500,
          height: '40px',
          padding: '0 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Ban size={14} color="#DC2626" />
        Suspender
      </button>
      <button
        type="button"
        className="flex items-center"
        style={{
          gap: '6px',
          backgroundColor: '#7C3AED',
          border: 'none',
          color: '#FFFFFF',
          fontSize: '13px',
          fontWeight: 600,
          height: '40px',
          padding: '0 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Pencil size={14} color="#FFFFFF" />
        Editar Loja
      </button>
    </>
  )

  return (
    <div className="flex flex-col h-full">
      <AdminTopBar left={topBarLeft} right={topBarRight} />

      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '28px 32px', gap: '20px', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            padding: '20px 24px',
          }}
        >
          {isLoading ? (
            <div className="flex flex-col" style={{ gap: '12px' }}>
              <SkeletonBlock w="56px" h={56} />
              <SkeletonBlock w="200px" h={24} />
              <SkeletonBlock w="300px" h={14} />
            </div>
          ) : (
            <div className="flex items-start" style={{ gap: '16px' }}>
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  backgroundColor: '#EFF6FF',
                }}
              >
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#2563EB',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {initials}
                </span>
              </div>
              <div className="flex flex-col" style={{ gap: '6px' }}>
                <div className="flex items-center" style={{ gap: '10px' }}>
                  <span
                    style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#0F172A',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {tenant?.name}
                  </span>
                  <StatusBadge status={tenantStatus} />
                  <PlanBadge plan={tenant?.plan ?? 'free'} />
                </div>
                <div className="flex items-center" style={{ gap: '20px' }}>
                  <span style={{ fontSize: '13px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                    Tipo: {TENANT_TYPE_LABELS[tenant?.type as keyof typeof TENANT_TYPE_LABELS] ?? tenant?.type}
                  </span>
                  <span style={{ fontSize: '13px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                    Criado em: {tenant?.createdAt ? formatDate(tenant.createdAt) : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="flex" style={{ gap: '16px' }}>
          {[
            {
              icon: TrendingUp,
              iconBg: '#F0FDF4',
              iconColor: '#16A34A',
              value: 'R$ 34.210',
              label: 'Total de Vendas',
            },
            {
              icon: ShoppingCart,
              iconBg: '#EFF6FF',
              iconColor: '#2563EB',
              value: '1.284',
              label: 'Pedidos Totais',
            },
            {
              icon: Package,
              iconBg: '#FDF4FF',
              iconColor: '#7C3AED',
              value: '—',
              label: 'Produtos Cadastrados',
            },
            {
              icon: Users,
              iconBg: '#FFF7ED',
              iconColor: '#EA580C',
              value: '—',
              label: 'Caixeiros Ativos',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center"
              style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                padding: '20px',
                gap: '16px',
              }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: stat.iconBg,
                }}
              >
                <stat.icon size={20} color={stat.iconColor} />
              </div>
              <div className="flex flex-col">
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#0F172A',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: '1.2',
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    color: '#64748B',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row: Orders + Alerts */}
        <div className="flex" style={{ gap: '20px', flex: 1 }}>
          {/* Orders card */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#0F172A',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Últimos Pedidos
              </span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: '#F1F5F9',
                    height: '36px',
                    borderBottom: '1px solid #E2E8F0',
                  }}
                >
                  {['#Pedido', 'Caixeiro', 'Total', 'Status', 'Data'].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: '0 20px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#64748B',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_ORDERS.map((order) => (
                  <tr
                    key={order.id}
                    style={{ height: '48px', borderBottom: '1px solid #F1F5F9' }}
                  >
                    <td style={{ padding: '0 20px', fontSize: '13px', color: '#0F172A', fontFamily: 'Inter, sans-serif', width: '100px' }}>
                      {order.id}
                    </td>
                    <td style={{ padding: '0 20px', fontSize: '13px', color: '#0F172A', fontFamily: 'Inter, sans-serif', width: '160px' }}>
                      {order.cashier}
                    </td>
                    <td style={{ padding: '0 20px', fontSize: '13px', color: '#0F172A', fontFamily: 'Inter, sans-serif', width: '120px' }}>
                      {order.total}
                    </td>
                    <td style={{ padding: '0 20px', width: '100px' }}>
                      <StatusBadge status={order.status} />
                    </td>
                    <td style={{ padding: '0 20px', fontSize: '13px', color: '#64748B', fontFamily: 'Inter, sans-serif', width: '120px' }}>
                      {order.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alerts card */}
          <div
            style={{
              width: '300px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <div
              className="flex items-center"
              style={{
                gap: '8px',
                padding: '16px 20px',
                borderBottom: '1px solid #FEE2E2',
              }}
            >
              <TriangleAlert size={16} color="#DC2626" />
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#0F172A',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Alertas de Estoque
              </span>
            </div>
            <div className="flex flex-col">
              {MOCK_ALERTS.map((alert) => (
                <div
                  key={alert.name}
                  className="flex items-center justify-between"
                  style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid #F1F5F9',
                  }}
                >
                  <div className="flex flex-col">
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#0F172A',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {alert.name}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: alert.level === 'critical' ? '#DC2626' : '#D97706',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      Estoque: {alert.stock}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: alert.level === 'critical' ? '#FEF2F2' : '#FEF3C7',
                      color: alert.level === 'critical' ? '#DC2626' : '#D97706',
                      borderRadius: '11px',
                      height: '22px',
                      padding: '0 10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {alert.level === 'critical' ? 'Crítico' : 'Baixo'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
