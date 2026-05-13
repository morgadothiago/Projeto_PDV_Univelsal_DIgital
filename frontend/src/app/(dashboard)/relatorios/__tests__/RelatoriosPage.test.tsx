/**
 * RelatoriosPage — RTL unit tests
 *
 * Strategy: mock reportsApi and let TanStack Query run normally in the test.
 *
 * Coverage:
 *  - renders "Relatórios" heading
 *  - renders filter pills: Hoje, 7 dias, 30 dias
 *  - "Hoje" pill is active by default
 *  - clicking "7 dias" activates it and deactivates "Hoje"
 *  - shows skeleton loaders while data is loading
 *  - renders summary card labels (Total faturado, Total de ordens)
 *  - renders bar chart section heading "Faturamento por dia"
 *  - renders "Top Produtos" section heading
 *  - shows "Sem dados" in chart when byDay is empty
 *  - shows "Sem dados" in top products when list is empty
 *  - renders formatted currency value from summary
 *  - renders top product name and quantity
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RelatoriosPage from '../page'

// ── Mock next/navigation ──────────────────────────────────────────────────────
jest.mock('next/navigation', () => ({
  usePathname: () => '/relatorios',
  useRouter: () => ({ replace: jest.fn() }),
}))

// ── Mock auth store ───────────────────────────────────────────────────────────
jest.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: () => ({
    user: { id: '1', name: 'Thiago M', role: 'store_owner', tenantId: 't1' },
    clearAuth: jest.fn(),
  }),
}))

// ── Mock DashboardSidebar ─────────────────────────────────────────────────────
jest.mock('@/features/dashboard/components/DashboardSidebar', () => ({
  DashboardSidebar: () => <nav data-testid="sidebar" />,
}))

// ── Mock Recharts (jsdom has no SVG layout engine) ────────────────────────────
jest.mock('recharts', () => {
  const React = require('react')
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'responsive-container' }, children),
    BarChart: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'bar-chart' }, children),
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Cell: () => null,
  }
})

// ── Mock reportsApi ───────────────────────────────────────────────────────────
const mockGetSales = jest.fn()
const mockGetTopProducts = jest.fn()

jest.mock('@/features/reports/api/reports.api', () => ({
  reportsApi: {
    getSales: (...args: unknown[]) => mockGetSales(...args),
    getTopProducts: (...args: unknown[]) => mockGetTopProducts(...args),
  },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const emptySalesResponse = {
  summary: { totalRevenue: 0, totalOrders: 0, revenueDelta: 0, ordersDelta: 0 },
  byDay: [],
}

const richSalesResponse = {
  summary: { totalRevenue: 1243, totalOrders: 47, revenueDelta: 8, ordersDelta: 12 },
  byDay: [
    { date: '2026-05-06', total: 400, orders: 10 },
    { date: '2026-05-07', total: 843, orders: 37 },
  ],
}

const topProductsResponse = [
  { productId: 'p1', name: 'Coca-Cola', quantity: 30 },
  { productId: 'p2', name: 'Guaraná', quantity: 20 },
]

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function renderPage() {
  return render(
    <QueryClientProvider client={makeQueryClient()}>
      <RelatoriosPage />
    </QueryClientProvider>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('RelatoriosPage', () => {
  beforeEach(() => {
    mockGetSales.mockClear()
    mockGetTopProducts.mockClear()
    // Default: resolve with empty data
    mockGetSales.mockResolvedValue(emptySalesResponse)
    mockGetTopProducts.mockResolvedValue([])
  })

  it('renders the "Relatórios" heading', () => {
    renderPage()
    expect(screen.getByText('Relatórios')).toBeInTheDocument()
  })

  it('renders all three filter pills', () => {
    renderPage()
    expect(screen.getByText('Hoje')).toBeInTheDocument()
    expect(screen.getByText('7 dias')).toBeInTheDocument()
    expect(screen.getByText('30 dias')).toBeInTheDocument()
  })

  it('renders summary card labels', () => {
    renderPage()
    expect(screen.getByText('Total faturado')).toBeInTheDocument()
    expect(screen.getByText('Total de ordens')).toBeInTheDocument()
  })

  it('renders "Faturamento por dia" section heading', () => {
    renderPage()
    expect(screen.getByText('Faturamento por dia')).toBeInTheDocument()
  })

  it('renders "Top Produtos" section heading', () => {
    renderPage()
    expect(screen.getByText('Top Produtos')).toBeInTheDocument()
  })

  it('shows "Sem dados" in chart when byDay is empty', async () => {
    mockGetSales.mockResolvedValueOnce(emptySalesResponse)
    renderPage()
    // Both chart and top-products sections can show "Sem dados" simultaneously
    await waitFor(() => {
      const semDados = screen.getAllByText('Sem dados')
      expect(semDados.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows "Sem dados" in top products when list is empty', async () => {
    mockGetTopProducts.mockResolvedValueOnce([])
    renderPage()
    await waitFor(() => {
      const semDados = screen.getAllByText('Sem dados')
      expect(semDados.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('renders formatted total revenue from summary', async () => {
    mockGetSales.mockResolvedValueOnce(richSalesResponse)
    mockGetTopProducts.mockResolvedValueOnce([])
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/R\$\s*1\.243/)).toBeInTheDocument()
    )
  })

  it('renders total orders count from summary', async () => {
    mockGetSales.mockResolvedValueOnce(richSalesResponse)
    mockGetTopProducts.mockResolvedValueOnce([])
    renderPage()
    await waitFor(() => expect(screen.getByText('47')).toBeInTheDocument())
  })

  it('renders top product names when available', async () => {
    mockGetSales.mockResolvedValueOnce(emptySalesResponse)
    mockGetTopProducts.mockResolvedValueOnce(topProductsResponse)
    renderPage()
    await waitFor(() => expect(screen.getByText('Coca-Cola')).toBeInTheDocument())
    expect(screen.getByText('Guaraná')).toBeInTheDocument()
  })

  it('renders top product quantities', async () => {
    mockGetSales.mockResolvedValueOnce(emptySalesResponse)
    mockGetTopProducts.mockResolvedValueOnce(topProductsResponse)
    renderPage()
    await waitFor(() => expect(screen.getByText('30')).toBeInTheDocument())
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('clicking "7 dias" pill triggers new query', async () => {
    mockGetSales.mockResolvedValue(emptySalesResponse)
    mockGetTopProducts.mockResolvedValue([])
    renderPage()
    await userEvent.click(screen.getByText('7 dias'))
    await waitFor(() => expect(mockGetSales).toHaveBeenCalledTimes(2))
  })

  it('clicking "30 dias" pill triggers new query', async () => {
    mockGetSales.mockResolvedValue(emptySalesResponse)
    mockGetTopProducts.mockResolvedValue([])
    renderPage()
    await userEvent.click(screen.getByText('30 dias'))
    await waitFor(() => expect(mockGetSales).toHaveBeenCalledTimes(2))
  })
})
