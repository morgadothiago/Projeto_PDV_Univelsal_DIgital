'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react'
import { AdminTopBar } from '@/features/admin/components/AdminTopBar'
import { useCreateTenant } from '@/features/admin/hooks/useCreateTenant'

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  type: z.enum(['generic', 'bakery', 'retail', 'digital']),
  ownerName: z.string().min(2, 'Nome do proprietário obrigatório'),
  ownerEmail: z.string().email('Email inválido'),
  ownerPassword: z.string().min(8, 'Mínimo 8 caracteres'),
  plan: z.enum(['free', 'pro']),
})

type FormData = z.infer<typeof schema>

const TYPE_OPTIONS: { value: FormData['type']; label: string }[] = [
  { value: 'retail', label: 'Varejo' },
  { value: 'bakery', label: 'Padaria' },
  { value: 'generic', label: 'Genérico' },
  { value: 'digital', label: 'Digital' },
]

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

const errorStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#DC2626',
  fontFamily: 'Inter, sans-serif',
  marginTop: '4px',
}

export default function NovaLojaPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { mutate: createTenant, isPending, error } = useCreateTenant()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { plan: 'free' as const, type: 'retail' as const },
  })

  const selectedPlan = watch('plan')

  const onSubmit = (data: FormData) => {
    createTenant({
      name: data.name,
      type: data.type,
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail,
      ownerPassword: data.ownerPassword,
    })
  }

  const topBarLeft = (
    <>
      <Link href="/admin/lojas" className="flex items-center no-underline">
        <ChevronLeft size={16} color="#64748B" />
      </Link>
      <span
        style={{
          fontSize: '13px',
          color: '#64748B',
          fontFamily: 'Inter, sans-serif',
          cursor: 'pointer',
        }}
        onClick={() => router.push('/admin/lojas')}
      >
        Lojas
      </span>
      <ChevronRight size={12} color="#94A3B8" />
      <span
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#0F172A',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Nova Loja
      </span>
    </>
  )

  const topBarRight = (
    <>
      <button
        type="button"
        onClick={() => router.push('/admin/lojas')}
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          color: '#64748B',
          fontSize: '14px',
          fontWeight: 500,
          height: '40px',
          padding: '0 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="nova-loja-form"
        disabled={isPending}
        className="flex items-center"
        style={{
          gap: '8px',
          backgroundColor: isPending ? '#A78BFA' : '#7C3AED',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 600,
          height: '40px',
          padding: '0 20px',
          borderRadius: '8px',
          cursor: isPending ? 'not-allowed' : 'pointer',
          border: 'none',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Plus size={16} color="#FFFFFF" />
        {isPending ? 'Criando...' : 'Criar Loja'}
      </button>
    </>
  )

  return (
    <div className="flex flex-col h-full">
      <AdminTopBar left={topBarLeft} right={topBarRight} />

      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: '32px 40px', gap: '24px', display: 'flex', flexDirection: 'column' }}
      >
        {/* Page header */}
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#0F172A',
              fontFamily: 'Inter, sans-serif',
              margin: 0,
            }}
          >
            Nova Loja
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#64748B',
              fontFamily: 'Inter, sans-serif',
              margin: '4px 0 0 0',
            }}
          >
            Preencha os dados para criar uma nova loja na plataforma
          </p>
        </div>

        {/* Form card */}
        <form
          id="nova-loja-form"
          onSubmit={handleSubmit(onSubmit)}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Row 1: Nome + Tipo */}
          <div className="flex" style={{ gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Nome da Loja *</label>
              <input
                {...register('name')}
                placeholder="Ex: Padaria do João"
                style={inputStyle}
              />
              {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Tipo de Negócio *</label>
              <div style={{ position: 'relative' }}>
                <select
                  {...register('type')}
                  style={{
                    ...inputStyle,
                    appearance: 'none',
                    paddingRight: '40px',
                    cursor: 'pointer',
                  }}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronRight
                  size={16}
                  color="#94A3B8"
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%) rotate(90deg)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
              {errors.type && <p style={errorStyle}>{errors.type.message}</p>}
            </div>
          </div>

          {/* Row 2: Owner name + Email */}
          <div className="flex" style={{ gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Nome do Proprietário *</label>
              <input
                {...register('ownerName')}
                placeholder="Nome completo"
                style={inputStyle}
              />
              {errors.ownerName && <p style={errorStyle}>{errors.ownerName.message}</p>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Email do Proprietário *</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  color="#94A3B8"
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  {...register('ownerEmail')}
                  placeholder="proprietario@email.com"
                  type="email"
                  style={{ ...inputStyle, paddingLeft: '40px' }}
                />
              </div>
              {errors.ownerEmail && <p style={errorStyle}>{errors.ownerEmail.message}</p>}
            </div>
          </div>

          {/* Row 3: Senha + Plano */}
          <div className="flex" style={{ gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Senha Inicial *</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="#94A3B8"
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  {...register('ownerPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  style={{ ...inputStyle, paddingLeft: '40px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={16} color="#94A3B8" />
                  ) : (
                    <Eye size={16} color="#94A3B8" />
                  )}
                </button>
              </div>
              {errors.ownerPassword && <p style={errorStyle}>{errors.ownerPassword.message}</p>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Plano</label>
              <div className="flex" style={{ gap: '12px' }}>
                {(['free', 'pro'] as const).map((plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setValue('plan', plan)}
                    style={{
                      flex: 1,
                      height: '44px',
                      border: `1px solid ${selectedPlan === plan ? '#7C3AED' : '#E2E8F0'}`,
                      borderRadius: '8px',
                      backgroundColor: selectedPlan === plan ? '#F5F3FF' : '#FFFFFF',
                      color: selectedPlan === plan ? '#7C3AED' : '#374151',
                      fontSize: '14px',
                      fontWeight: selectedPlan === plan ? 600 : 400,
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {plan === 'free' ? 'Gratuito' : 'Pro'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: '#F1F5F9' }} />

          {/* Info tip */}
          <div
            className="flex items-start"
            style={{
              gap: '10px',
              backgroundColor: '#EFF6FF',
              borderRadius: '8px',
              padding: '12px 16px',
            }}
          >
            <Info size={16} color="#2563EB" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p
              style={{
                fontSize: '13px',
                color: '#1D4ED8',
                fontFamily: 'Inter, sans-serif',
                margin: 0,
              }}
            >
              O proprietário receberá um e-mail com as credenciais de acesso após a criação da
              loja.
            </p>
          </div>

          {/* API Error */}
          {error && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                borderRadius: '8px',
                padding: '12px 16px',
                border: '1px solid #FCA5A5',
              }}
            >
              <p
                style={{
                  fontSize: '13px',
                  color: '#DC2626',
                  fontFamily: 'Inter, sans-serif',
                  margin: 0,
                }}
              >
                Erro ao criar loja. Verifique os dados e tente novamente.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
