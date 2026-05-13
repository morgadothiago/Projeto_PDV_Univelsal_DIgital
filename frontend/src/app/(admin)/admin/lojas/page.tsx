'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { AdminTopBar } from '@/features/admin/components/AdminTopBar'
import { TenantRow } from '@/features/admin/components/TenantRow'
import { useTenants } from '@/features/admin/hooks/useTenants'
export default function LojasPage() {
  const { data, isLoading } = useTenants()
  const tenants = data?.data ?? []

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
        Lojas
      </span>
      <span
        style={{
          fontSize: '12px',
          color: '#64748B',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Gerencie todas as lojas da plataforma
      </span>
    </div>
  )

  const topBarRight = (
    <Link
      href="/admin/lojas/new"
      className="flex items-center no-underline"
      style={{
        gap: '8px',
        backgroundColor: '#7C3AED',
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: 600,
        height: '40px',
        padding: '0 20px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <Plus size={16} color="#FFFFFF" />
      Nova Loja
    </Link>
  )

  return (
    <div className="flex flex-col h-full">
      <AdminTopBar left={topBarLeft} right={topBarRight} />

      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '28px 32px', gap: '20px', display: 'flex', flexDirection: 'column' }}
      >
        {/* Table card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            overflow: 'hidden',
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
                {(['Loja', 'Tipo', 'Plano', 'Status', 'Ações'] as const).map((col) => (
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
                tenants.map((tenant) => (
                  <TenantRow key={tenant.id} tenant={tenant} showDetailLink />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
