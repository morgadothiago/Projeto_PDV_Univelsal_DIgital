'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { useTenantStore } from '@/store/useTenantStore'
import { clearAllAppStorage } from '@/lib/storage'

export function useRegister() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      storeName: string
      storeType: string
      ownerName: string
      email: string
      password: string
    }) => authApi.register(data),
    onSuccess: () => {
      clearAllAppStorage()
      useAuthStore.getState().clearAuth()
      useTenantStore.getState().reset()
      queryClient.clear()
      toast.success('Loja criada com sucesso! Faça login para continuar.')
      router.push('/login')
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err))
    },
  })
}
