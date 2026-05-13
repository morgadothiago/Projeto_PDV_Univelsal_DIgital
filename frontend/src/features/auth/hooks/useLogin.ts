'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import type { LoginFormData } from '../schemas/login.schema'
import type { AxiosError } from 'axios'

export function useLogin() {
  const { setAuth, setRefreshToken } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: ({ accessToken, refreshToken, user }) => {
      setAuth(accessToken, user)
      setRefreshToken(refreshToken)
      toast.success('Login realizado com sucesso!')
      if (user.role === 'super_admin') router.push('/admin')
      else if (user.role === 'store_owner') router.push('/dashboard')
      else router.push('/pdv')
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error?.response?.data?.message ?? 'Email ou senha inválidos')
    },
  })
}
