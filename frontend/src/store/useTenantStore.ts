import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TenantStore {
  primaryColor: string
  logoUrl: string | null
  setPrimaryColor: (color: string) => void
  setTenantSettings: (settings: { primaryColor?: string; logoUrl?: string }) => void
  applyTheme: () => void
}

export const useTenantStore = create<TenantStore>()(
  persist(
    (set, get) => ({
      primaryColor: '#2563EB',
      logoUrl: null,
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
      partialize: (state) => ({ primaryColor: state.primaryColor, logoUrl: state.logoUrl }),
    }
  )
)
