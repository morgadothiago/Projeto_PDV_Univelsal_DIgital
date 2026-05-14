'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { authApi } from '../api/auth.api'

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => {
      toast.success('Se o email existir, você receberá o link em breve.')
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err))
    },
  })
}
