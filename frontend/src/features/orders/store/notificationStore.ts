import { create } from 'zustand'

interface NotificationState {
  newOrderCount: number
  increment: () => void
  clear: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  newOrderCount: 0,
  increment: () => set((s) => ({ newOrderCount: s.newOrderCount + 1 })),
  clear: () => set({ newOrderCount: 0 }),
}))
