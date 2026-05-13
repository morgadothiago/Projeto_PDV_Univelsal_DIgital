import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TenantStore {
  primaryColor: string
  setPrimaryColor: (color: string) => void
}

export const useTenantStore = create<TenantStore>()(
  persist(
    (set) => ({
      primaryColor: '#2563EB',
      setPrimaryColor: (color) => set({ primaryColor: color }),
    }),
    { name: 'pdv-tenant' }
  )
)
