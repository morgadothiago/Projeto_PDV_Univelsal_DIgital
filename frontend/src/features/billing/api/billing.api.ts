import { api } from '@/lib/axios'

export interface PlanUsage {
  plan: 'free' | 'pro'
  products: { current: number; limit: number | null }
  cashiers: { current: number; limit: number | null }
  ordersThisMonth: { current: number; limit: number | null }
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

export const billingApi = {
  getUsage: (): Promise<PlanUsage> =>
    api.get<ApiResponse<PlanUsage>>('/billing/usage').then((r) => r.data.data),

  upgradePlan: (plan: 'free' | 'pro'): Promise<void> =>
    api.patch('/billing/subscription/plan', { plan }).then(() => undefined),
}
