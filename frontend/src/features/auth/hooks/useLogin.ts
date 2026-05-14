'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi } from '../api/auth.api'
import { tenantApi } from '../api/tenant.api'
import { useAuthStore } from '../store/auth.store'
import { useTenantStore } from '@/store/useTenantStore'
import type { LoginFormData } from '../schemas/login.schema'
import { getApiErrorMessage } from '@/lib/api-error'

export function useLogin() {
  const { setAuth, setRefreshToken } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: ({ accessToken, refreshToken, user }) => {
      setAuth(accessToken, user)
      setRefreshToken(refreshToken)
      toast.success('Login realizado com sucesso!')
      // Apply tenant theme non-critically
      if (user.tenantId) {
        tenantApi.getMyTenant().then((tenant) => {
          if (tenant.settings) {
            useTenantStore.getState().setTenantSettings(tenant.settings)
          }
        }).catch(() => {})
      }
      if (user.role === 'super_admin') router.push('/admin')
      else if (user.role === 'store_owner') router.push('/dashboard')
      else router.push('/pdv')
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err))
    },
  })
}
