'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import type { LoginFormData } from '../schemas/login.schema'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: ({ accessToken, user }) => {
      setAuth(accessToken, user)
      if (user.role === 'super_admin') router.push('/admin')
      else if (user.role === 'store_owner') router.push('/dashboard')
      else router.push('/pdv')
    },
  })
}
