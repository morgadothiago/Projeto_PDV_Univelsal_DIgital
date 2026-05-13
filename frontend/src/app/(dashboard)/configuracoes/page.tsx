'use client'

import { useEffect } from 'react'
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar'
import { useTenantStore } from '@/store/useTenantStore'

export default function ConfiguracoesPage() {
  const { primaryColor, setPrimaryColor } = useTenantStore()

  // Apply stored color on mount
  useEffect(() => {
    document.documentElement.style.setProperty('--pdv-primary', primaryColor)
  }, [primaryColor])

  function handleColorChange(color: string) {
    setPrimaryColor(color)
    document.documentElement.style.setProperty('--pdv-primary', color)
  }

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
            style={{ maxWidth: '480px', padding: '24px' }}
          >
            {/* Section: Identidade Visual */}
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="font-semibold" style={{ fontSize: '15px', color: '#0F172A' }}>
                  Identidade Visual
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                  Personalize a cor principal da sua loja.
                </p>
              </div>

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
                    value={primaryColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      padding: '2px',
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                  <div className="flex flex-col gap-1">
                    <span style={{ fontSize: '13px', color: '#64748B' }}>
                      Valor atual:{' '}
                      <code style={{ fontSize: '12px', color: '#0F172A' }}>{primaryColor}</code>
                    </span>
                    {/* Live preview button */}
                    <button
                      style={{
                        height: '36px',
                        padding: '0 16px',
                        borderRadius: '8px',
                        backgroundColor: primaryColor,
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'default',
                      }}
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="rounded-[8px] border border-[#FEF9C3] flex items-start gap-3"
                style={{ padding: '12px', backgroundColor: '#FEFCE8' }}
              >
                <span style={{ fontSize: '12px', color: '#854D0E', lineHeight: '1.5' }}>
                  A cor é salva localmente e aplicada imediatamente ao painel. Integração com backend disponível em versão futura.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
