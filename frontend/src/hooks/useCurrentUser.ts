import { useAuthStore } from '@/features/auth/store/auth.store'

export function useCurrentUser() {
  return useAuthStore((state) => state.user)
}
