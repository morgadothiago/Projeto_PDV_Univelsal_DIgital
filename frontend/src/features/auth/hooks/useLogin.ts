'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authApi } from '../api/auth.api'
import { tenantApi } from '../api/tenant.api'
import { useAuthStore } from '../store/auth.store'
import { useTenantStore } from '@/store/useTenantStore'
import type { LoginFormData } from '../schemas/login.schema'
import { getApiErrorMessage } from '@/lib/api-error'
import { clearSessionStorage } from '@/lib/storage'

export function useLogin() {
  const { setAuth, setRefreshToken, setBootstrapping } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: ({ accessToken, refreshToken, user }) => {
      const currentUserId = useAuthStore.getState().user?.id
      const isNewUser = currentUserId !== user.id

      if (isNewUser) {
        setBootstrapping(true)
        clearSessionStorage()
        useTenantStore.getState().reset()
        queryClient.clear()
      }

      setAuth(accessToken, user)
      setRefreshToken(refreshToken)
      toast.success('Login realizado com sucesso!')

      if (user.tenantId && user.role === 'store_owner') {
        tenantApi.getMyTenant()
          .then((tenant) => {
            useTenantStore.getState().setTenantSettings({
              primaryColor: tenant.settings?.primaryColor,
              logoUrl: tenant.settings?.logoUrl,
              onboardingCompleted: tenant.settings?.onboardingCompleted ?? false,
            })
            const isOnboarded = tenant.settings?.onboardingCompleted === true
            setBootstrapping(false)
            router.push(isOnboarded ? '/dashboard' : '/onboarding')
          })
          .catch(() => {
            setBootstrapping(false)
            router.push('/onboarding')
          })
        return
      }

      if (user.tenantId) {
        tenantApi.getMyTenant()
          .then((tenant) => {
            useTenantStore.getState().setTenantSettings({
              primaryColor: tenant.settings?.primaryColor,
              logoUrl: tenant.settings?.logoUrl,
              onboardingCompleted: tenant.settings?.onboardingCompleted ?? false,
            })
          })
          .catch(() => {})
          .finally(() => setBootstrapping(false))
      } else {
        setBootstrapping(false)
      }

      if (user.role === 'super_admin') router.push('/admin')
      else router.push('/pdv')
    },
    onError: (err) => {
      setBootstrapping(false)
      toast.error(getApiErrorMessage(err))
    },
  })
}
