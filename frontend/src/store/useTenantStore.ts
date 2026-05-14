import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TenantStore {
  primaryColor: string
  logoUrl: string | null
  onboardingCompleted: boolean
  setPrimaryColor: (color: string) => void
  setTenantSettings: (settings: { primaryColor?: string; logoUrl?: string; onboardingCompleted?: boolean }) => void
  applyTheme: () => void
}

export const useTenantStore = create<TenantStore>()(
  persist(
    (set, get) => ({
      primaryColor: '#2563EB',
      logoUrl: null,
      onboardingCompleted: false,
      setPrimaryColor: (color) => {
        set({ primaryColor: color })
        if (typeof window !== 'undefined') {
          document.documentElement.style.setProperty('--pdv-primary', color)
        }
      },
      setTenantSettings: (settings) => {
        set({
          primaryColor: settings.primaryColor ?? get().primaryColor,
          logoUrl: settings.logoUrl ?? get().logoUrl,
          onboardingCompleted: settings.onboardingCompleted ?? get().onboardingCompleted,
        })
        get().applyTheme()
      },
      applyTheme: () => {
        if (typeof window !== 'undefined') {
          document.documentElement.style.setProperty('--pdv-primary', get().primaryColor)
        }
      },
    }),
    {
      name: 'pdv-tenant',
      partialize: (state) => ({
        primaryColor: state.primaryColor,
        logoUrl: state.logoUrl,
        onboardingCompleted: state.onboardingCompleted,
      }),
    }
  )
)
