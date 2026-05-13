'use client'

import { useState } from 'react'
import { Save, SlidersHorizontal, Send, CreditCard, Lock, TriangleAlert } from 'lucide-react'
import { AdminTopBar } from '@/features/admin/components/AdminTopBar'

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '44px',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '0 14px',
  fontSize: '14px',
  color: '#0F172A',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#FFFFFF',
}

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  fontFamily: 'Inter, sans-serif',
  marginBottom: '6px',
  display: 'block',
}

interface SectionCardProps {
  icon: React.ComponentType<{ size: number; color: string }>
  title: string
  children: React.ReactNode
  borderColor?: string
  headerBg?: string
  titleColor?: string
}

function SectionCard({
  icon: Icon,
  title,
  children,
  borderColor = '#E2E8F0',
  headerBg,
  titleColor = '#0F172A',
}: SectionCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      <div
        className="flex items-center"
        style={{
          gap: '10px',
          padding: '16px 20px',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: headerBg,
        }}
      >
        <Icon size={16} color="#7C3AED" />
        <span
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: titleColor,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {title}
        </span>
      </div>
      <div
        className="flex flex-col"
        style={{ padding: '20px', gap: '16px' }}
      >
        {children}
      </div>
    </div>
  )
}

interface ToggleRowProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        backgroundColor: '#F8FAFC',
        height: '40px',
        padding: '0 16px',
        borderRadius: '8px',
      }}
    >
      <span
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: '#374151',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: '40px',
          height: '22px',
          borderRadius: '11px',
          backgroundColor: checked ? '#7C3AED' : '#CBD5E1',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background-color 0.2s',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '3px',
            left: checked ? '21px' : '3px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  )
}

export default function ConfiguracoesPage() {
  const [twoFA, setTwoFA] = useState(false)
  const [auditLogs, setAuditLogs] = useState(true)

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
        Configurações da Plataforma
      </span>
      <span
        style={{
          fontSize: '12px',
          color: '#64748B',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Gerencie as configurações globais do PDV Universal
      </span>
    </div>
  )

  const topBarRight = (
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
      <Save size={14} color="#FFFFFF" />
      Salvar Configurações
    </button>
  )

  return (
    <div className="flex flex-col h-full">
      <AdminTopBar left={topBarLeft} right={topBarRight} />

      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '28px 32px' }}
      >
        <div className="flex" style={{ gap: '24px', alignItems: 'flex-start' }}>
          {/* Left column */}
          <div className="flex flex-col" style={{ flex: 1, gap: '16px' }}>
            {/* Geral */}
            <SectionCard icon={SlidersHorizontal} title="Geral">
              <div>
                <label style={labelStyle}>Nome da Plataforma</label>
                <input
                  type="text"
                  defaultValue="PDV Universal"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>URL Base</label>
                <input
                  type="text"
                  defaultValue="https://pdv-universal.vercel.app"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Timezone</label>
                <input
                  type="text"
                  defaultValue="America/Sao_Paulo"
                  style={inputStyle}
                />
              </div>
            </SectionCard>

            {/* E-mails Transacionais */}
            <SectionCard icon={Send} title="E-mails Transacionais">
              <div>
                <label style={labelStyle}>API Key do Resend</label>
                <input
                  type="password"
                  placeholder="re_xxxxxxxxxxxxxxxx"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email Remetente</label>
                <input
                  type="email"
                  placeholder="noreply@pdv-universal.com"
                  style={inputStyle}
                />
              </div>
              <button
                type="button"
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: 500,
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Testar Conexão
              </button>
            </SectionCard>
          </div>

          {/* Right column */}
          <div className="flex flex-col" style={{ flex: 1, gap: '16px' }}>
            {/* MercadoPago */}
            <SectionCard icon={CreditCard} title="MercadoPago">
              <div>
                <label style={labelStyle}>Access Token MP</label>
                <input
                  type="password"
                  placeholder="APP_USR-xxxxxxxx"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Webhook URL</label>
                <input
                  type="text"
                  placeholder="https://sua-api.com/webhooks/mp"
                  style={inputStyle}
                />
              </div>
              <button
                type="button"
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  color: '#374151',
                  fontSize: '13px',
                  fontWeight: 500,
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Testar Integração
              </button>
            </SectionCard>

            {/* Segurança */}
            <SectionCard icon={Lock} title="Segurança">
              <ToggleRow
                label="Autenticação 2FA"
                checked={twoFA}
                onChange={setTwoFA}
              />
              <ToggleRow
                label="Logs de Auditoria"
                checked={auditLogs}
                onChange={setAuditLogs}
              />
              <div
                className="flex items-start"
                style={{
                  gap: '8px',
                  backgroundColor: '#EFF6FF',
                  borderRadius: '8px',
                  padding: '12px 16px',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    color: '#1D4ED8',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Alterações nas configurações de segurança entram em vigor imediatamente para
                  todos os usuários da plataforma.
                </span>
              </div>
            </SectionCard>

            {/* Zona de Perigo */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #FCA5A5',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                overflow: 'hidden',
              }}
            >
              <div
                className="flex items-center"
                style={{
                  gap: '10px',
                  padding: '16px 20px',
                  borderBottom: '1px solid #FCA5A5',
                  backgroundColor: '#FEF2F2',
                }}
              >
                <TriangleAlert size={16} color="#DC2626" />
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#DC2626',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Zona de Perigo
                </span>
              </div>
              <div
                className="flex flex-col"
                style={{ padding: '20px', gap: '12px' }}
              >
                <p
                  style={{
                    fontSize: '13px',
                    color: '#64748B',
                    fontFamily: 'Inter, sans-serif',
                    margin: 0,
                  }}
                >
                  Esta ação irá resetar todas as configurações da plataforma para os valores
                  padrão. Esta operação é irreversível.
                </p>
                <button
                  type="button"
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: '#DC2626',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    height: '36px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Resetar todas as configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
