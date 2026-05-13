'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, ArrowLeft, Loader2 } from 'lucide-react'
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const { mutate, isPending, isSuccess } = useForgotPassword()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (email) mutate(email)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-[400px] rounded-2xl bg-white p-10 shadow-lg">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB]">
            <ShoppingCart size={28} color="#FFFFFF" aria-hidden />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0F172A]">Esqueceu a senha?</h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Digite seu email e enviaremos um link de recuperação
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="flex flex-col gap-4 text-center">
            <div className="rounded-xl bg-green-50 px-6 py-4">
              <p className="text-sm font-medium text-green-700">
                Se o email estiver cadastrado, você receberá o link em breve.
              </p>
              <p className="mt-1 text-xs text-green-600">Verifique também sua caixa de spam.</p>
            </div>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium text-[#2563EB] hover:underline"
            >
              <ArrowLeft size={14} />
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[13px] font-medium text-[#0F172A]">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
                className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !email}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                'Enviar link'
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
        )}
      </div>
    </main>
  )
}
