import Link from 'next/link'
import { PlanBadge } from './PlanBadge'
import { StatusBadge } from './StatusBadge'
import type { ITenant } from '../interfaces/admin.interface'
import { TENANT_TYPE_LABELS } from '../interfaces/admin.interface'

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

interface TenantRowProps {
  tenant: ITenant
  showDetailLink?: boolean
  onChangePlan?: (tenant: ITenant) => void
}

export function TenantRow({ tenant, showDetailLink = false, onChangePlan }: TenantRowProps) {
  const colors = AVATAR_COLORS[tenant.type] ?? AVATAR_COLORS['generic']
  const initials = getInitials(tenant.name)
  const status = tenant.isActive ? 'active' : 'suspended'

  return (
    <tr
      style={{
        borderBottom: '1px solid #F1F5F9',
        height: '60px',
      }}
    >
      {/* Loja */}
      <td style={{ padding: '0 20px', width: '260px' }}>
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
          <div className="flex flex-col">
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
        </div>
      </td>

      {/* Tipo */}
      <td style={{ padding: '0 20px', width: '160px' }}>
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
      <td style={{ padding: '0 20px', width: '140px' }}>
        <PlanBadge plan={tenant.plan} />
      </td>

      {/* Status */}
      <td style={{ padding: '0 20px', width: '120px' }}>
        <StatusBadge status={status} />
      </td>

      {/* Ações */}
      <td style={{ padding: '0 20px', width: '160px' }}>
        {showDetailLink ? (
          <Link
            href={`/admin/lojas/${tenant.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              height: '32px',
              padding: '0 14px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Ver detalhes
          </Link>
        ) : (
          <button
            onClick={() => onChangePlan?.(tenant)}
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
        )}
      </td>
    </tr>
  )
}
