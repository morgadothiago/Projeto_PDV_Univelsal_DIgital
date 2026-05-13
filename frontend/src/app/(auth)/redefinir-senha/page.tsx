'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import { useResetPassword } from '@/features/auth/hooks/useResetPassword'

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    redirect('/login')
  }

  // token is guaranteed non-null here (redirect above)
  const safeToken = token as string
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const { mutate, isPending } = useResetPassword()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError(null)
    if (newPassword.length < 8) {
      setValidationError('Senha deve ter no mínimo 8 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Senhas não coincidem')
      return
    }
    mutate({ token: safeToken, newPassword })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-password" className="text-[13px] font-medium text-[#0F172A]">
          Nova senha
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isPending}
            className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 pr-11 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-50"
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
        <label htmlFor="confirm-password" className="text-[13px] font-medium text-[#0F172A]">
          Confirmar nova senha
        </label>
        <input
          id="confirm-password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isPending}
          className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-50"
        />
      </div>

      {validationError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {validationError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Redefinindo...</span>
          </>
        ) : (
          'Redefinir senha'
        )}
      </button>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-center text-sm text-[#64748B] hover:text-[#2563EB] transition-colors"
      >
        <ArrowLeft size={14} />
        Voltar ao login
      </Link>
    </form>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-[400px] rounded-2xl bg-white p-10 shadow-lg">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB]">
            <ShoppingCart size={28} color="#FFFFFF" aria-hidden />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0F172A]">Redefinir senha</h1>
            <p className="mt-1 text-sm text-[#64748B]">Crie uma nova senha para sua conta</p>
          </div>
        </div>

        <Suspense fallback={
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-[#2563EB]" />
          </div>
        }>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  )
}
