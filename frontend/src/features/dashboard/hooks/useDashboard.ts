import { useQuery } from '@tanstack/react-query'
import { fetchDashboardKPIs, fetchWeeklyChart, fetchTopProducts } from '../api/dashboard.api'

export function useKPIs() {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: fetchDashboardKPIs,
    staleTime: 60 * 1000,
  })
}

export function useWeeklyChart() {
  return useQuery({
    queryKey: ['dashboard', 'weekly'],
    queryFn: fetchWeeklyChart,
    staleTime: 5 * 60 * 1000,
  })
}

export function useTopProducts() {
  return useQuery({
    queryKey: ['dashboard', 'top-products'],
    queryFn: fetchTopProducts,
    staleTime: 5 * 60 * 1000,
  })
}
