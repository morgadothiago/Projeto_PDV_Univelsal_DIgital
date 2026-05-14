'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { tenantApi } from '../api/tenant.api'
import { useTenantStore } from '@/store/useTenantStore'

export function useRegister() {
  const { setAuth, setRefreshToken } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: {
      storeName: string
      storeType: string
      ownerName: string
      email: string
      password: string
    }) => authApi.register(data),
    onSuccess: ({ accessToken, refreshToken, user }) => {
      setAuth(accessToken, user)
      setRefreshToken(refreshToken)
      toast.success('Loja criada com sucesso!')
      // Fetch tenant settings non-critically
      if (user.tenantId) {
        tenantApi.getMyTenant().then((tenant) => {
          if (tenant.settings) {
            useTenantStore.getState().setTenantSettings(tenant.settings)
          }
        }).catch(() => {})
      }
      router.push('/dashboard')
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err))
    },
  })
}
