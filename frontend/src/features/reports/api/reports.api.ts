import { api } from '@/lib/axios'

interface BackendResponse<T> {
  success: boolean
  data: T
  meta?: { page: number; total: number; limit: number }
}

interface SalesReportRaw {
  total: string
  orderCount: number
  series: Array<{ date: string; total: string; orderCount: number }>
}

interface TopProductRaw {
  productId: string
  productName: string
  totalQuantity: number
  totalRevenue: string
}

export interface ISalesByDay {
  date: string
  total: number
  orders: number
}

export interface ISalesSummary {
  totalRevenue: number
  totalOrders: number
  revenueDelta: number
  ordersDelta: number
}

export interface ITopProduct {
  productId: string
  name: string
  quantity: number
}

export interface IPaymentMethodBreakdown {
  method: string
  total: number
  count: number
  percentage: number
}

export interface ISalesReportResponse {
  summary: ISalesSummary
  byDay: ISalesByDay[]
}

export const reportsApi = {
  getSales: async (params: {
    groupBy: string
    dateFrom: string
    dateTo: string
  }): Promise<ISalesReportResponse> => {
    const res = await api.get<BackendResponse<SalesReportRaw>>('/reports/sales', { params })
    const raw = res.data.data
    return {
      summary: {
        totalRevenue: parseFloat(raw?.total ?? '0'),
        totalOrders: raw?.orderCount ?? 0,
        revenueDelta: 0,
        ordersDelta: 0,
      },
      byDay: (raw?.series ?? []).map((s) => ({
        date: s.date,
        total: parseFloat(s.total),
        orders: s.orderCount,
      })),
    }
  },

  getTopProducts: async (params: {
    dateFrom: string
    dateTo: string
    limit: number
  }): Promise<ITopProduct[]> => {
    const res = await api.get<BackendResponse<TopProductRaw[]>>('/reports/top-products', { params })
    return (res.data.data ?? []).map((p) => ({
      productId: p.productId,
      name: p.productName,
      quantity: p.totalQuantity,
    }))
  },

  getPaymentMethods: async (params: {
    dateFrom: string
    dateTo: string
  }): Promise<IPaymentMethodBreakdown[]> => {
    const res = await api.get<BackendResponse<IPaymentMethodBreakdown[]>>('/reports/payment-methods', { params })
    return res.data.data ?? []
  },
}
