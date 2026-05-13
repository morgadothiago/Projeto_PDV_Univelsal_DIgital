/**
 * PDV Page — integration tests
 *
 * Strategy: mock API hooks and stores directly.
 *
 * Coverage:
 *  - renders PDV page with product grid
 *  - search with debounce calls useProducts with correct param
 *  - empty state shown when no products
 *  - loading state shown while fetching
 */

import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ── Module mocks ──────────────────────────────────────────────────────────────

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

jest.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: () => ({
    user: { id: '1', name: 'Carlos A.', role: 'cashier', email: 'ca@test.com', tenantId: 't1' },
    token: 'tok',
  }),
}))

const mockAddItem = jest.fn()
jest.mock('@/features/orders/store/cart.store', () => ({
  useCartStore: (selector: (s: unknown) => unknown) => {
    const state = {
      items: [],
      paymentMethod: null,
      addItem: mockAddItem,
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      setPaymentMethod: jest.fn(),
    }
    return selector ? selector(state) : state
  },
  selectTotal: () => 0,
  selectItemCount: () => 0,
}))

const mockUseProducts = jest.fn()
jest.mock('@/features/products/hooks/useProducts', () => ({
  useProducts: (...args: unknown[]) => mockUseProducts(...args),
}))

jest.mock('@/features/products/hooks/useCategories', () => ({
  useCategories: () => ({ data: [], isLoading: false }),
}))

// ── Import page after mocks ───────────────────────────────────────────────────

import PdvPage from '@/app/(dashboard)/pdv/page'

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeProduct = (id: string, name: string) => ({
  id,
  name,
  price: 5,
  unitType: 'unidade',
  categoryId: null,
  categoryName: null,
  imageUrl: null,
  stock: 10,
  active: true,
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PDV Page', () => {
  beforeEach(() => {
    mockAddItem.mockClear()
    mockUseProducts.mockReturnValue({
      data: {
        items: [makeProduct('1', 'Produto A'), makeProduct('2', 'Produto B')],
        meta: { page: 1, total: 2, limit: 50 },
      },
      isLoading: false,
    })
  })

  it('renders product names on initial load', () => {
    render(<PdvPage />)
    expect(screen.getByText('Produto A')).toBeInTheDocument()
    expect(screen.getByText('Produto B')).toBeInTheDocument()
  })

  it('shows loading spinner while products are loading', () => {
    mockUseProducts.mockReturnValue({ data: undefined, isLoading: true })
    render(<PdvPage />)
    expect(screen.getByLabelText(/carregando produtos/i)).toBeInTheDocument()
  })

  it('shows empty state when no products found', () => {
    mockUseProducts.mockReturnValue({
      data: { items: [], meta: { page: 1, total: 0, limit: 50 } },
      isLoading: false,
    })
    render(<PdvPage />)
    expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument()
  })

  it('calls useProducts with debounced search param after 300ms', async () => {
    jest.useFakeTimers()

    // userEvent with advanceTimers so internal delays don't stall
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    render(<PdvPage />)

    const inputs = screen.getAllByRole('searchbox', { name: /buscar produto/i })
    const searchInput = inputs[0]

    // Type the query — this changes state immediately but debounce hasn't fired
    await user.type(searchInput, 'coca')

    // Advance past debounce delay
    act(() => {
      jest.advanceTimersByTime(300)
    })

    await waitFor(() => {
      const callsWithSearch = mockUseProducts.mock.calls.filter(
        (call) => call[0]?.search === 'coca'
      )
      expect(callsWithSearch.length).toBeGreaterThan(0)
    })

    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })
})
