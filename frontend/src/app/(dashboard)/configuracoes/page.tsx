'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar'
import { useTenantStore } from '@/store/useTenantStore'
import { tenantApi } from '@/features/auth/api/tenant.api'
import { useAuthStore } from '@/features/auth/store/auth.store'

function isValidUrl(url: string): boolean {
  try { new URL(url); return true } catch { return false }
}

export default function ConfiguracoesPage() {
  const { primaryColor, logoUrl, setTenantSettings } = useTenantStore()
  const user = useAuthStore((s) => s.user)

  const [localColor, setLocalColor] = useState(primaryColor)
  const [localLogoUrl, setLocalLogoUrl] = useState(logoUrl ?? '')

  // Load tenant settings from backend
  const { data: tenant } = useQuery({
    queryKey: ['tenant-me'],
    queryFn: tenantApi.getMyTenant,
    enabled: !!user?.tenantId,
  })

  useEffect(() => {
    if (tenant?.settings) {
      setLocalColor(tenant.settings.primaryColor ?? primaryColor)
      setLocalLogoUrl(tenant.settings.logoUrl ?? '')
    }
  }, [tenant])

  // Preview live color
  useEffect(() => {
    document.documentElement.style.setProperty('--pdv-primary', localColor)
  }, [localColor])

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => tenantApi.updateMySettings({ primaryColor: localColor, logoUrl: localLogoUrl || undefined }),
    onSuccess: (data) => {
      if (data.settings) setTenantSettings(data.settings)
      toast.success('Configurações salvas!')
    },
    onError: () => {
      toast.error('Erro ao salvar configurações')
    },
  })

  const isStoreOwner = user?.role === 'store_owner'

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      <DashboardSidebar />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <div
          className="flex items-center bg-white flex-shrink-0"
          style={{ height: '62px', padding: '0 24px', borderBottom: '1px solid #E2E8F0' }}
        >
          <h1 className="font-bold" style={{ fontSize: '18px', color: '#0F172A' }}>
            Configurações da Loja
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '24px' }}>
          <div
            className="mx-auto flex flex-col gap-6 rounded-xl border border-[#E2E8F0] bg-white"
            style={{ maxWidth: '520px', padding: '28px' }}
          >
            {isStoreOwner ? (
              <>
                {/* Section: Identidade Visual */}
                <div className="flex flex-col gap-5">
                  <div>
                    <h2 className="font-semibold" style={{ fontSize: '15px', color: '#0F172A' }}>
                      Identidade Visual
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                      Personalize a cor e o logo da sua loja.
                    </p>
                  </div>

                  {/* Color picker */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="primary-color"
                      className="font-medium"
                      style={{ fontSize: '13px', color: '#0F172A' }}
                    >
                      Cor principal
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        id="primary-color"
                        type="color"
                        value={localColor}
                        onChange={(e) => setLocalColor(e.target.value)}
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '10px',
                          border: '1px solid #E2E8F0',
                          cursor: 'pointer',
                          padding: '3px',
                          backgroundColor: '#FFFFFF',
                        }}
                      />
                      <div className="flex flex-col gap-2">
                        <span style={{ fontSize: '13px', color: '#64748B' }}>
                          Hex:{' '}
                          <code style={{ fontSize: '12px', color: '#0F172A', fontFamily: 'monospace' }}>
                            {localColor}
                          </code>
                        </span>
                        <div
                          style={{
                            height: '36px',
                            padding: '0 18px',
                            borderRadius: '8px',
                            backgroundColor: localColor,
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          Preview do botão
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logo URL */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="logo-url"
                      className="font-medium"
                      style={{ fontSize: '13px', color: '#0F172A' }}
                    >
                      Logo da loja (URL)
                    </label>
                    <input
                      id="logo-url"
                      type="url"
                      placeholder="https://minha-loja.com/logo.png"
                      value={localLogoUrl}
                      onChange={(e) => setLocalLogoUrl(e.target.value)}
                      style={{
                        height: '44px',
                        width: '100%',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        padding: '0 14px',
                        fontSize: '14px',
                        color: '#0F172A',
                        outline: 'none',
                      }}
                    />
                    {localLogoUrl && isValidUrl(localLogoUrl) && (
                      <div className="mt-1 flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={localLogoUrl}
                          alt="Preview do logo"
                          style={{ height: '48px', borderRadius: '8px', border: '1px solid #E2E8F0', objectFit: 'contain' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                        <span style={{ fontSize: '12px', color: '#64748B' }}>Preview</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => save()}
                    disabled={isPending}
                    style={{
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: localColor,
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: isPending ? 'not-allowed' : 'pointer',
                      opacity: isPending ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Salvar configurações
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8" style={{ color: '#64748B', fontSize: '14px' }}>
                Configurações disponíveis apenas para donos de loja.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
