/**
 * EstoquePage — RTL unit tests
 *
 * Strategy: mock useProducts hook and stockApi to avoid ESM/MSW issues.
 *
 * Coverage:
 *  - renders "Estoque" heading
 *  - renders "Entrada" button
 *  - shows skeleton loaders while loading
 *  - shows empty state when no products
 *  - renders product cards with name and category
 *  - shows low-stock alert banner when products have low stock
 *  - does NOT show alert banner when all stock is OK
 *  - applies correct badge label (Ok / Baixo / Crítico)
 *  - opens entrada sheet when "Entrada" button is clicked
 *  - closes entrada sheet on overlay click
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EstoquePage from '../page'
import type { IProduct } from '@/features/products/interfaces/product.interface'

// ── Mock next/navigation ──────────────────────────────────────────────────────
jest.mock('next/navigation', () => ({
  usePathname: () => '/estoque',
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
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

// ── Mock stockApi ─────────────────────────────────────────────────────────────
const mockAddEntry = jest.fn()
jest.mock('@/features/stock/api/stock.api', () => ({
  stockApi: { addEntry: (...args: unknown[]) => mockAddEntry(...args) },
}))

// ── Mock useProducts ──────────────────────────────────────────────────────────
let mockProductsData: { items: IProduct[] } | undefined = undefined
let mockIsLoading = false

jest.mock('@/features/products/hooks/useProducts', () => ({
  useProducts: () => ({ data: mockProductsData, isLoading: mockIsLoading }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeProduct(overrides: Partial<IProduct> = {}): IProduct {
  return {
    id: 'prod-1',
    name: 'Coca-Cola',
    price: 5.0,
    unitType: 'unidade',
    categoryId: 'cat-1',
    categoryName: 'Bebidas',
    imageUrl: null,
    stock: 20,
    isActive: true,
    ...overrides,
  }
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function renderPage() {
  return render(
    <QueryClientProvider client={makeQueryClient()}>
      <EstoquePage />
    </QueryClientProvider>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('EstoquePage', () => {
  beforeEach(() => {
    mockProductsData = undefined
    mockIsLoading = false
    mockAddEntry.mockClear()
  })

  it('renders the page heading "Estoque"', () => {
    mockProductsData = { items: [] }
    renderPage()
    expect(screen.getByText('Estoque')).toBeInTheDocument()
  })

  it('renders the "Entrada" button', () => {
    mockProductsData = { items: [] }
    renderPage()
    expect(screen.getByText('Entrada')).toBeInTheDocument()
  })

  it('shows skeleton loaders while loading', () => {
    mockIsLoading = true
    mockProductsData = undefined
    const { container } = renderPage()
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows empty state when no products', () => {
    mockProductsData = { items: [] }
    renderPage()
    expect(screen.getByText('Nenhum produto cadastrado')).toBeInTheDocument()
  })

  it('renders a product card with name and category', () => {
    mockProductsData = { items: [makeProduct()] }
    renderPage()
    expect(screen.getByText('Coca-Cola')).toBeInTheDocument()
    expect(screen.getByText('Bebidas')).toBeInTheDocument()
  })

  it('renders "Sem categoria" when categoryName is null', () => {
    mockProductsData = { items: [makeProduct({ categoryName: null })] }
    renderPage()
    expect(screen.getByText('Sem categoria')).toBeInTheDocument()
  })

  it('shows low-stock alert banner when products have low stock', () => {
    mockProductsData = {
      items: [makeProduct({ stock: 10 }), makeProduct({ id: 'prod-2', name: 'Produto B', stock: 3 })],
    }
    renderPage()
    expect(screen.getByText(/produtos com estoque baixo/i)).toBeInTheDocument()
  })

  it('does NOT show alert banner when all stock is OK', () => {
    mockProductsData = { items: [makeProduct({ stock: 25 })] }
    renderPage()
    expect(screen.queryByText(/estoque baixo/i)).not.toBeInTheDocument()
  })

  it('shows "Ok" badge for stock > 15', () => {
    mockProductsData = { items: [makeProduct({ stock: 20 })] }
    renderPage()
    expect(screen.getByText('Ok')).toBeInTheDocument()
  })

  it('shows "Baixo" badge for stock between 6 and 15', () => {
    mockProductsData = { items: [makeProduct({ stock: 10 })] }
    renderPage()
    expect(screen.getByText('Baixo')).toBeInTheDocument()
  })

  it('shows "Crítico" badge for stock <= 5', () => {
    mockProductsData = { items: [makeProduct({ stock: 2 })] }
    renderPage()
    expect(screen.getByText('Crítico')).toBeInTheDocument()
  })

  it('opens the entrada sheet when "Entrada" button is clicked', async () => {
    mockProductsData = { items: [makeProduct()] }
    renderPage()
    await userEvent.click(screen.getByText('Entrada'))
    expect(screen.getByText('Entrada de Estoque')).toBeInTheDocument()
  })

  it('closes the entrada sheet when the close button is clicked', async () => {
    mockProductsData = { items: [makeProduct()] }
    renderPage()
    await userEvent.click(screen.getByText('Entrada'))
    expect(screen.getByText('Entrada de Estoque')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /fechar/i }))
    await waitFor(() =>
      expect(screen.queryByText('Entrada de Estoque')).not.toBeInTheDocument()
    )
  })
})
