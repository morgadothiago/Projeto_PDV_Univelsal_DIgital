import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULTS = {
  primaryColor: '#2563EB',
  logoUrl: null as string | null,
  onboardingCompleted: false,
}

interface TenantStore {
  primaryColor: string
  logoUrl: string | null
  onboardingCompleted: boolean
  setPrimaryColor: (color: string) => void
  setTenantSettings: (settings: { primaryColor?: string; logoUrl?: string; onboardingCompleted?: boolean }) => void
  reset: () => void
  applyTheme: () => void
}

export const useTenantStore = create<TenantStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      setPrimaryColor: (color) => {
        set({ primaryColor: color })
        if (typeof window !== 'undefined') {
          document.documentElement.style.setProperty('--pdv-primary', color)
        }
      },
      setTenantSettings: (settings) => {
        set({
          primaryColor: settings.primaryColor ?? DEFAULTS.primaryColor,
          logoUrl: settings.logoUrl ?? DEFAULTS.logoUrl,
          onboardingCompleted: settings.onboardingCompleted ?? DEFAULTS.onboardingCompleted,
        })
        get().applyTheme()
      },
      reset: () => {
        set(DEFAULTS)
        if (typeof window !== 'undefined') {
          document.documentElement.style.setProperty('--pdv-primary', DEFAULTS.primaryColor)
        }
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
