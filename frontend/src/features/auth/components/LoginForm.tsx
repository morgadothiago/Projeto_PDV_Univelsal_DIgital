'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { loginSchema, type LoginFormData } from '../schemas/login.schema'
import { useLogin } from '../hooks/useLogin'
import { getApiErrorMessage } from '@/lib/api-error'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate, isPending, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
    mutate(data)
  }

  const apiErrorMessage = error ? getApiErrorMessage(error) : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-4">
        {/* Email field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-[13px] font-medium text-[#0F172A]"
          >
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            aria-invalid={!!errors.email}
            className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-50"
            disabled={isPending}
            {...register('email')}
          />
          {errors.email && (
            <p role="alert" className="text-xs text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-[13px] font-medium text-[#0F172A]"
          >
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              className="h-12 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 pr-11 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 disabled:opacity-50"
              disabled={isPending}
              {...register('password')}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff size={18} aria-hidden />
              ) : (
                <Eye size={18} aria-hidden />
              )}
            </button>
          </div>
          {errors.password && (
            <p role="alert" className="text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link
            href="/esqueci-senha"
            className="text-[13px] text-[#2563EB] hover:underline"
          >
            Esqueceu a senha?
          </Link>
        </div>

        {/* API error */}
        {apiErrorMessage && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {apiErrorMessage}
          </p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPending}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
          aria-label="Entrar"
        >
          {isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden />
              <span>Entrando...</span>
            </>
          ) : (
            'Entrar'
          )}
        </button>

        <Link
          href="/cadastrar"
          className="text-center text-[13px] text-[#64748B] hover:text-[#2563EB] transition-colors"
        >
          Não tem conta? <span className="font-semibold text-[#2563EB]">Cadastre sua loja grátis</span>
        </Link>
      </div>
    </form>
  )
}
