export type TenantType = 'generic' | 'bakery' | 'retail' | 'digital'
export type TenantPlan = 'free' | 'pro'
export type TenantStatus = 'active' | 'suspended'

export interface ITenant {
  id: string
  name: string
  type: TenantType
  plan: TenantPlan
  stockEnabled: boolean
  isActive: boolean
  settings: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface ITenantsResponse {
  data: ITenant[]
  meta: {
    page: number
    total: number
    limit: number
  }
}

export interface ICreateTenantPayload {
  name: string
  type: TenantType
  ownerName: string
  ownerEmail: string
  ownerPassword: string
}

export interface IAdminMetrics {
  activeTenants: number
  todayOrders: number
  todayRevenue: number
  totalTenants: number
}

export const TENANT_TYPE_LABELS: Record<TenantType, string> = {
  generic: 'Genérico',
  bakery: 'Padaria',
  retail: 'Varejo',
  digital: 'Digital',
}
