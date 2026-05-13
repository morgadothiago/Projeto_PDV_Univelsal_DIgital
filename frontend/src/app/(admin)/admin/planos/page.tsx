'use client'

import { Check, X } from 'lucide-react'
import { AdminTopBar } from '@/features/admin/components/AdminTopBar'
import { PlanBadge } from '@/features/admin/components/PlanBadge'
import { StatusBadge } from '@/features/admin/components/StatusBadge'
import { useTenants } from '@/features/admin/hooks/useTenants'
import type { ITenant } from '@/features/admin/interfaces/admin.interface'
import { TENANT_TYPE_LABELS } from '@/features/admin/interfaces/admin.interface'

const AVATAR_COLORS: Record<string, { bg: string; text: string }> = {
  bakery: { bg: '#EFF6FF', text: '#2563EB' },
  retail: { bg: '#F0FDF4', text: '#16A34A' },
  digital: { bg: '#FFF7ED', text: '#EA580C' },
  generic: { bg: '#F5F3FF', text: '#7C3AED' },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

const PLACEHOLDER_TENANTS: ITenant[] = [
  {
    id: '1',
    name: 'Padaria Central',
    type: 'bakery',
    plan: 'pro',
    stockEnabled: true,
    isActive: true,
    settings: null,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Mercado Verde',
    type: 'retail',
    plan: 'free',
    stockEnabled: true,
    isActive: true,
    settings: null,
    createdAt: '2026-02-15T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Casa & Material',
    type: 'generic',
    plan: 'free',
    stockEnabled: false,
    isActive: false,
    settings: null,
    createdAt: '2026-03-20T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
  },
]

export default function PlanosPage() {
  const { data, isLoading } = useTenants()
  const tenants = data?.data ?? PLACEHOLDER_TENANTS

  const topBarLeft = (
    <div className="flex flex-col">
      <span
        style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#0F172A',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Gerenciar Planos
      </span>
      <span
        style={{
          fontSize: '12px',
          color: '#64748B',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Gerencie os planos atribuídos a cada loja
      </span>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <AdminTopBar left={topBarLeft} />

      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '28px 32px', gap: '20px', display: 'flex', flexDirection: 'column' }}
      >
        {/* Plan cards */}
        <div className="flex" style={{ gap: '20px' }}>
          {/* Free plan card */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#374151',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Gratuito
              </span>
              <span
                style={{
                  backgroundColor: '#F1F5F9',
                  color: '#64748B',
                  fontSize: '12px',
                  fontWeight: 700,
                  borderRadius: '11px',
                  height: '26px',
                  padding: '0 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                FREE
              </span>
            </div>
            <span
              style={{
                fontSize: '13px',
                color: '#64748B',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Para lojas que estão começando
            </span>
            <div className="flex flex-col" style={{ gap: '8px' }}>
              {[
                { label: 'Até 100 produtos', included: true },
                { label: '1 caixeiro', included: true },
                { label: 'Sem relatórios', included: false },
              ].map((feature) => (
                <div key={feature.label} className="flex items-center" style={{ gap: '8px' }}>
                  {feature.included ? (
                    <Check size={14} color="#16A34A" />
                  ) : (
                    <X size={14} color="#94A3B8" />
                  )}
                  <span
                    style={{
                      fontSize: '13px',
                      color: feature.included ? '#374151' : '#94A3B8',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro plan card */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '2px solid #7C3AED',
              boxShadow: '0 4px 12px rgba(124,58,237,0.15)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#0F172A',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Pago
              </span>
              <span
                style={{
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  borderRadius: '11px',
                  height: '26px',
                  padding: '0 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                PRO
              </span>
            </div>
            <span
              style={{
                fontSize: '13px',
                color: '#64748B',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Para lojas que buscam crescer
            </span>
            <div className="flex flex-col" style={{ gap: '8px' }}>
              {[
                'Produtos ilimitados',
                'Caixeiros ilimitados',
                'Relatórios completos',
                'Suporte prioritário',
              ].map((feature) => (
                <div key={feature} className="flex items-center" style={{ gap: '8px' }}>
                  <Check size={14} color="#7C3AED" />
                  <span
                    style={{
                      fontSize: '13px',
                      color: '#374151',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plans table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: '#F1F5F9',
                  height: '44px',
                  borderBottom: '1px solid #E2E8F0',
                }}
              >
                {[
                  { label: 'Loja', width: '260px' },
                  { label: 'Tipo', width: '160px' },
                  { label: 'Plano Atual', width: '140px' },
                  { label: 'Status', width: '120px' },
                  { label: 'Ações', width: '160px' },
                ].map((col) => (
                  <th
                    key={col.label}
                    style={{
                      padding: '0 20px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#64748B',
                      fontFamily: 'Inter, sans-serif',
                      width: col.width,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} style={{ height: '60px', borderBottom: '1px solid #F1F5F9' }}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} style={{ padding: '0 20px' }}>
                        <div
                          style={{
                            height: '16px',
                            borderRadius: '4px',
                            backgroundColor: '#F1F5F9',
                            width: '80%',
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                tenants.map((tenant) => {
                  const colors = AVATAR_COLORS[tenant.type] ?? AVATAR_COLORS['generic']
                  const initials = getInitials(tenant.name)
                  const status = tenant.isActive ? 'active' : 'suspended'

                  return (
                    <tr
                      key={tenant.id}
                      style={{ height: '60px', borderBottom: '1px solid #F1F5F9' }}
                    >
                      {/* Loja */}
                      <td style={{ padding: '0 20px' }}>
                        <div className="flex items-center" style={{ gap: '12px' }}>
                          <div
                            className="flex items-center justify-center flex-shrink-0"
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: colors.bg,
                            }}
                          >
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                color: colors.text,
                                fontFamily: 'Inter, sans-serif',
                              }}
                            >
                              {initials}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: '#0F172A',
                              fontFamily: 'Inter, sans-serif',
                            }}
                          >
                            {tenant.name}
                          </span>
                        </div>
                      </td>

                      {/* Tipo */}
                      <td style={{ padding: '0 20px' }}>
                        <span
                          style={{
                            fontSize: '13px',
                            color: '#64748B',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          {TENANT_TYPE_LABELS[tenant.type] ?? tenant.type}
                        </span>
                      </td>

                      {/* Plano */}
                      <td style={{ padding: '0 20px' }}>
                        <PlanBadge plan={tenant.plan} />
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0 20px' }}>
                        <StatusBadge status={status} />
                      </td>

                      {/* Ações */}
                      <td style={{ padding: '0 20px' }}>
                        <button
                          type="button"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            backgroundColor: tenant.plan === 'pro' ? '#7C3AED' : 'transparent',
                            color: tenant.plan === 'pro' ? '#FFFFFF' : '#7C3AED',
                            border: tenant.plan === 'pro' ? 'none' : '1px solid #7C3AED',
                            fontSize: '12px',
                            fontWeight: 600,
                            height: '32px',
                            padding: '0 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          Alterar Plano
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
