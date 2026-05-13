'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRegister } from '@/features/auth/hooks/useRegister'

const STORE_TYPES = [
  { value: 'mercado', label: 'Mercado / Minimercado' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'padaria', label: 'Padaria' },
  { value: 'lanchonete', label: 'Lanchonete / Fast Food' },
  { value: 'farmácia', label: 'Farmácia' },
  { value: 'outro', label: 'Outro' },
]

export default function CadastrarPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    storeName: '',
    storeType: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  const { mutate, isPending } = useRegister()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError(null)

    if (!form.storeName || !form.storeType || !form.ownerName || !form.email || !form.password) {
      setValidationError('Preencha todos os campos obrigatórios')
      return
    }
    if (form.password.length < 8) {
      setValidationError('Senha deve ter no mínimo 8 caracteres')
      return
    }
    if (form.password !== form.confirmPassword) {
      setValidationError('Senhas não coincidem')
      return
    }

    mutate({
      storeName: form.storeName,
      storeType: form.storeType,
      ownerName: form.ownerName,
      email: form.email,
      password: form.password,
    })
  }

  const inputClass =
    'h-12 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-50'

  return (
    <main className="flex min-h-screen bg-[#F8FAFC]">
      {/* LEFT PANEL */}
      <aside className="hidden md:flex md:w-[420px] flex-col justify-between bg-[#0F172A] p-12">
        <div className="flex flex-col gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB]">
            <ShoppingCart size={28} color="#FFFFFF" aria-hidden />
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight">PDV Universal</h1>
          <p className="text-[#94A3B8]">Comece grátis e cresça sem limites</p>
        </div>
        <ul className="flex flex-col gap-4">
          {['Vendas ultrarrápidas', 'Controle de estoque', 'Relatórios em tempo real', 'Multi-caixeiro'].map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm text-[#94A3B8]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/20 text-[#2563EB] text-xs">✓</span>
              {f}
            </li>
          ))}
        </ul>
        <p className="text-xs text-[#475569]">© 2026 PDV Universal</p>
      </aside>

      {/* RIGHT PANEL */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-[460px] rounded-2xl bg-white p-8 shadow-lg md:p-10">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-[#0F172A]">Criar sua loja</h2>
            <p className="mt-1 text-sm text-[#64748B]">Sem cartão de crédito — grátis para começar</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Linha 1: Nome da loja + Tipo */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="storeName" className="text-[13px] font-medium text-[#0F172A]">
                  Nome da loja <span className="text-red-500">*</span>
                </label>
                <input
                  id="storeName"
                  name="storeName"
                  type="text"
                  placeholder="Padaria do João"
                  value={form.storeName}
                  onChange={handleChange}
                  disabled={isPending}
                  required
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="storeType" className="text-[13px] font-medium text-[#0F172A]">
                  Tipo de negócio <span className="text-red-500">*</span>
                </label>
                <select
                  id="storeType"
                  name="storeType"
                  value={form.storeType}
                  onChange={handleChange}
                  disabled={isPending}
                  required
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="">Selecione...</option>
                  {STORE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seu nome */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ownerName" className="text-[13px] font-medium text-[#0F172A]">
                Seu nome <span className="text-red-500">*</span>
              </label>
              <input
                id="ownerName"
                name="ownerName"
                type="text"
                placeholder="João da Silva"
                value={form.ownerName}
                onChange={handleChange}
                disabled={isPending}
                required
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[13px] font-medium text-[#0F172A]">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="joao@loja.com"
                value={form.email}
                onChange={handleChange}
                disabled={isPending}
                required
                className={inputClass}
              />
            </div>

            {/* Linha: Senha + Confirmar */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-[13px] font-medium text-[#0F172A]">
                  Senha <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    disabled={isPending}
                    required
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-[13px] font-medium text-[#0F172A]">
                  Confirmar senha <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={isPending}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {validationError && (
              <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                {validationError}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Criando sua loja...</span>
                </>
              ) : (
                'Criar minha loja grátis'
              )}
            </button>

            <p className="text-center text-[13px] text-[#64748B]">
              Já tem conta?{' '}
              <Link href="/login" className="font-semibold text-[#2563EB] hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}
