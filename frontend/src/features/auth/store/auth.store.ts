import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '@/types/roles.types'

export interface AuthUser {
  id: string
  tenantId: string | null
  email: string
  name: string
  role: Role
}

interface AuthStore {
  token: string | null
  user: AuthUser | null
  setAuth: (token: string, user: AuthUser) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'pdv-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
