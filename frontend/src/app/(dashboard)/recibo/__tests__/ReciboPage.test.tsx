/**
 * ReciboPage — RTL unit tests
 *
 * Coverage:
 *  - shows fallback when no lastOrder
 *  - renders order data (items, total, payment method)
 *  - "Nova Venda" clears stores and navigates to /pdv
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReciboPage from '../page'
import type { IOrder } from '@/features/orders/interfaces/order.interface'

// ── Mock next/navigation ──────────────────────────────────────────────────────
const mockPush = jest.fn()
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}))

// ── Mock order store ───────────────────────────────────────────────────────────
const mockClearOrder = jest.fn()
let mockLastOrder: IOrder | null = null

jest.mock('@/features/orders/store/order.store', () => ({
  useOrderStore: (selector: (s: unknown) => unknown) => {
    const state = {
      lastOrder: mockLastOrder,
      clearOrder: mockClearOrder,
    }
    return selector ? selector(state) : state
  },
}))

// ── Mock cart store ────────────────────────────────────────────────────────────
const mockClearCart = jest.fn()
jest.mock('@/features/orders/store/cart.store', () => ({
  useCartStore: (selector: (s: unknown) => unknown) => {
    const state = { clearCart: mockClearCart }
    return selector ? selector(state) : state
  },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeOrder(overrides: Partial<IOrder> = {}): IOrder {
  return {
    orderId: 'order-abc123',
    total: 11.0,
    paymentMethod: 'cash',
    items: [
      { productId: 'prod-1', name: 'Coca-Cola 350ml', quantity: 2, price: 5.5 },
    ],
    createdAt: '2026-05-12T14:30:00.000Z',
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('ReciboPage', () => {
  beforeEach(() => {
    mockLastOrder = null
    mockClearOrder.mockClear()
    mockClearCart.mockClear()
    mockPush.mockClear()
  })

  it('shows fallback when no lastOrder', () => {
    render(<ReciboPage />)
    expect(screen.getByText(/nenhum pedido encontrado/i)).toBeInTheDocument()
  })

  it('renders "Venda Finalizada!" when order is present', () => {
    mockLastOrder = makeOrder()
    render(<ReciboPage />)
    expect(screen.getByText('Venda Finalizada!')).toBeInTheDocument()
  })

  it('renders item names', () => {
    mockLastOrder = makeOrder()
    render(<ReciboPage />)
    expect(screen.getAllByText(/coca-cola 350ml/i).length).toBeGreaterThan(0)
  })

  it('renders payment method label', () => {
    mockLastOrder = makeOrder({ paymentMethod: 'cash' })
    render(<ReciboPage />)
    expect(screen.getByText(/pagamento: dinheiro/i)).toBeInTheDocument()
  })

  it('renders PIX label when paymentMethod is pix', () => {
    mockLastOrder = makeOrder({ paymentMethod: 'pix' })
    render(<ReciboPage />)
    expect(screen.getByText(/pagamento: pix/i)).toBeInTheDocument()
  })

  it('"Nova Venda" clears cart, clears order and navigates to /pdv', async () => {
    mockLastOrder = makeOrder()
    render(<ReciboPage />)
    await userEvent.click(screen.getByRole('button', { name: /nova venda/i }))
    expect(mockClearCart).toHaveBeenCalledTimes(1)
    expect(mockClearOrder).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/pdv')
  })

  it('renders order number from orderId last 4 chars', () => {
    mockLastOrder = makeOrder({ orderId: 'order-abc123' })
    render(<ReciboPage />)
    // 'order-abc123'.slice(-4).toUpperCase() === 'C123'
    expect(screen.getByText(/pedido #C123/i)).toBeInTheDocument()
  })
})
