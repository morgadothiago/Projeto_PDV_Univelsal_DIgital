'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, ExternalLink, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
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
  const [tableLabel, setTableLabel] = useState('Mesa 1')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://frontend-gold-ten-55.vercel.app'
  const menuUrl = user?.tenantId ? `${appUrl}/cardapio/${user.tenantId}` : ''

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'CA'

  function handleCopyUrl() {
    navigator.clipboard
      .writeText(menuUrl)
      .then(() => toast.success('Link copiado!'))
      .catch(() => {})
  }

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
          <h1 className="text-[18px] font-bold text-[#0F172A]">Configuracoes</h1>
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
                    <span className="font-bold text-[#0F172A]">{user?.name ?? 'Usuario'}</span>
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
                  value={user?.tenantId ?? 'Nao definido'}
                />
              </Card>
            </div>

            {/* Preferencias */}
            <div>
              <SectionTitle>Preferencias</SectionTitle>
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

            {/* Cardapio Digital QR */}
            <div>
              <SectionTitle>Cardapio Digital</SectionTitle>
              <Card>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
                      <QrCode size={18} className="text-[#2563EB]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">QR do Cardapio</p>
                      <p className="mt-0.5 text-xs text-[#64748B]">
                        Clientes escaneiam e veem seus produtos no celular.
                      </p>
                    </div>
                  </div>

                  {menuUrl ? (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[#64748B]">
                          Etiqueta (ex: Mesa 1, Balcao)
                        </label>
                        <input
                          type="text"
                          value={tableLabel}
                          onChange={(e) => setTableLabel(e.target.value)}
                          className="h-9 rounded-lg border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#2563EB]"
                        />
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
                          <QRCodeSVG value={menuUrl} size={180} />
                          <p className="mt-2 text-center text-xs text-[#64748B]">{tableLabel}</p>
                        </div>

                        <div className="flex w-full gap-2">
                          <button
                            onClick={handleCopyUrl}
                            className="flex flex-1 h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
                          >
                            <Copy size={13} /> Copiar link
                          </button>
                          <a
                            href={menuUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-1 h-9 items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] text-sm font-semibold text-white hover:opacity-90"
                          >
                            <ExternalLink size={13} /> Ver cardapio
                          </a>
                        </div>

                        <p className="text-[11px] text-[#94A3B8] text-center break-all">{menuUrl}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-[#94A3B8]">
                      Tenant nao disponivel. Faca login novamente.
                    </p>
                  )}
                </div>
              </Card>
            </div>

            {/* Sessao */}
            <div>
              <SectionTitle>Sessao</SectionTitle>
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
