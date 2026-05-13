'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/shared/Sidebar'
import { useAuthStore } from '@/features/auth/store/auth.store'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
      {children}
    </h2>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white" style={{ padding: '14px 16px' }}>
      {children}
    </div>
  )
}

function RowItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#0F172A]">{label}</span>
      <span className="max-w-[160px] truncate text-right text-sm text-[#64748B]">{value}</span>
    </div>
  )
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#0F172A]">{label}</span>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 ${
          value ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default function ConfiguracoesPdvPage() {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [confirmBeforeFinish, setConfirmBeforeFinish] = useState(true)

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'CA'

  function handleSignOut() {
    clearAuth()
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <div
          className="flex flex-shrink-0 items-center border-b border-[#E2E8F0] bg-white px-6"
          style={{ height: '62px' }}
        >
          <h1 className="text-[18px] font-bold text-[#0F172A]">Configurações</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-3 max-w-lg">

            {/* Minha Conta */}
            <div>
              <SectionTitle>Minha Conta</SectionTitle>
              <Card>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#1E3A5F]">
                    <span className="text-base font-bold text-[#60A5FA]">{initials}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[#0F172A]">{user?.name ?? 'Usuário'}</span>
                    <span className="text-[13px] text-[#64748B]">{user?.email ?? ''}</span>
                    <span className="mt-0.5 inline-flex w-fit items-center rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[11px] font-medium text-[#2563EB]">
                      Caixeiro
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Loja */}
            <div>
              <SectionTitle>Loja</SectionTitle>
              <Card>
                <RowItem
                  label="Loja atual"
                  value={user?.tenantId ?? 'Não definido'}
                />
              </Card>
            </div>

            {/* Preferências */}
            <div>
              <SectionTitle>Preferências</SectionTitle>
              <Card>
                <div className="flex flex-col gap-4">
                  <ToggleRow
                    label="Som ao adicionar item"
                    value={soundEnabled}
                    onChange={setSoundEnabled}
                  />
                  <div className="border-t border-[#E2E8F0]" />
                  <ToggleRow
                    label="Confirmar antes de finalizar"
                    value={confirmBeforeFinish}
                    onChange={setConfirmBeforeFinish}
                  />
                </div>
              </Card>
            </div>

            {/* Sessão */}
            <div>
              <SectionTitle>Sessão</SectionTitle>
              <button
                onClick={handleSignOut}
                className="w-full rounded-xl border border-[#E2E8F0] bg-white text-[#DC2626] font-semibold transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                style={{ height: '52px' }}
              >
                Sair da conta
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
