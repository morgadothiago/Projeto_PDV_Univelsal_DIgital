'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authApi } from '../api/auth.api'

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => {
      toast.success('Se o email existir, você receberá o link em breve.')
    },
    onError: () => {
      toast.error('Erro ao enviar email. Tente novamente.')
    },
  })
}
