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
  refreshToken: string | null
  user: AuthUser | null
  _hasHydrated: boolean
  setAuth: (token: string, user: AuthUser) => void
  clearAuth: () => void
  setHasHydrated: (v: boolean) => void
  setRefreshToken: (refreshToken: string) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      _hasHydrated: false,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, refreshToken: null, user: null }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
    }),
    {
      name: 'pdv-auth',
      partialize: (state) => ({ token: state.token, refreshToken: state.refreshToken, user: state.user }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.warn('[auth] Rehydration error:', error)
        state?.setHasHydrated(true)
      },
    }
  )
)
