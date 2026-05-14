import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { adminApi } from '../api/admin.api'
import type { ICreateTenantPayload } from '../interfaces/admin.interface'

export function useCreateTenant() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: ICreateTenantPayload) => adminApi.createTenant(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      router.push('/admin/lojas')
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err))
    },
  })
}
