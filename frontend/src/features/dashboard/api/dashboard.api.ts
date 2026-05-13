import { api } from '@/lib/axios'
import type { IDashboardKPIs, ITopProduct, IWeeklyBar } from '../interfaces/dashboard.interface'

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function subtractDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - days)
  return d
}

interface SalesReportItem {
  date: string;
  totalOrders: number;
  totalRevenue: number;
}

interface SalesReportResponse {
  data: SalesReportItem[];
}

interface PaginatedResponse {
  total: number;
}

interface TopProductsResponse {
  data: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
  }>;
}

export async function fetchDashboardKPIs(): Promise<IDashboardKPIs> {
  const today = new Date()
  const yesterday = subtractDays(today, 1)
  const todayStr = formatDate(today)
  const yesterdayStr = formatDate(yesterday)

  const [todayReport, yesterdayReport, productsRes, usersRes] = await Promise.all([
    api.get<SalesReportResponse>('/reports/sales', {
      params: { groupBy: 'day', dateFrom: todayStr, dateTo: todayStr },
    }),
    api.get<SalesReportResponse>('/reports/sales', {
      params: { groupBy: 'day', dateFrom: yesterdayStr, dateTo: yesterdayStr },
    }),
    api.get<PaginatedResponse>('/products', { params: { page: 1, limit: 1 } }),
    api.get<PaginatedResponse>('/users', { params: { page: 1, limit: 1 } }),
  ])

  const todayData = todayReport.data.data?.[0]
  const yesterdayData = yesterdayReport.data.data?.[0]

  const salesToday = todayData?.totalOrders ?? 0
  const salesYesterday = yesterdayData?.totalOrders ?? 0
  const revenueToday = todayData?.totalRevenue ?? 0
  const revenueYesterday = yesterdayData?.totalRevenue ?? 0

  const salesDelta = Math.round(((salesToday - salesYesterday) / (salesYesterday || 1)) * 100)
  const revenueDelta = Math.round(((revenueToday - revenueYesterday) / (revenueYesterday || 1)) * 100)

  return {
    salesToday,
    salesDelta,
    revenueToday,
    revenueDelta,
    activeProducts: (productsRes.data as unknown as PaginatedResponse).total ?? 0,
    cashiersCount: (usersRes.data as unknown as PaginatedResponse).total ?? 0,
  }
}

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export async function fetchWeeklyChart(): Promise<IWeeklyBar[]> {
  const today = new Date()
  const sevenDaysAgo = subtractDays(today, 6)
  const dateFrom = formatDate(sevenDaysAgo)
  const dateTo = formatDate(today)

  const res = await api.get<SalesReportResponse>('/reports/sales', {
    params: { groupBy: 'day', dateFrom, dateTo },
  })

  const todayStr = formatDate(today)
  const dataMap = new Map<string, number>()
  for (const item of res.data.data ?? []) {
    dataMap.set(item.date, item.totalOrders)
  }

  const bars: IWeeklyBar[] = []
  for (let i = 6; i >= 0; i--) {
    const d = subtractDays(today, i)
    const dateStr = formatDate(d)
    bars.push({
      day: DAY_LABELS[d.getDay()],
      orders: dataMap.get(dateStr) ?? 0,
      isToday: dateStr === todayStr,
    })
  }
  return bars
}

export async function fetchTopProducts(): Promise<ITopProduct[]> {
  const today = new Date()
  const sevenDaysAgo = subtractDays(today, 6)

  const res = await api.get<TopProductsResponse>('/reports/top-products', {
    params: {
      dateFrom: formatDate(sevenDaysAgo),
      dateTo: formatDate(today),
      limit: 5,
    },
  })

  return res.data.data ?? []
}
