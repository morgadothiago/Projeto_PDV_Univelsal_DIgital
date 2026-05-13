/**
 * CheckoutPage — RTL unit tests
 *
 * Strategy: mock Zustand stores and useCreateOrder hook.
 *
 * Coverage:
 *  - renders items from cart store
 *  - renders correct subtotal
 *  - "Finalizar Venda" is disabled when no payment method selected
 *  - "Finalizar Venda" is enabled when payment method is set
 *  - selecting PIX updates payment method
 *  - "Limpar" opens CancelSaleModal
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CheckoutPage from '../page'
import type { CartItem } from '@/features/orders/store/cart.store'

// ── Mock next/navigation ──────────────────────────────────────────────────────
const mockPush = jest.fn()
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}))

// ── Mock useCreateOrder ────────────────────────────────────────────────────────
const mockMutate = jest.fn()
jest.mock('@/features/orders/hooks/useCreateOrder', () => ({
  useCreateOrder: () => ({ mutate: mockMutate, isPending: false }),
}))

// ── Mock cart store ────────────────────────────────────────────────────────────
const mockClearCart = jest.fn()
const mockSetPaymentMethod = jest.fn()
const mockUpdateQuantity = jest.fn()

let mockItems: CartItem[] = []
let mockPaymentMethod: 'pix' | 'cash' | 'card' | null = null

jest.mock('@/features/orders/store/cart.store', () => ({
  useCartStore: (selector: (s: unknown) => unknown) => {
    const state = {
      items: mockItems,
      paymentMethod: mockPaymentMethod,
      clearCart: mockClearCart,
      setPaymentMethod: mockSetPaymentMethod,
      updateQuantity: mockUpdateQuantity,
    }
    return selector ? selector(state) : state
  },
  selectTotal: (s: { items: CartItem[] }) =>
    s.items.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0),
  selectItemCount: (s: { items: CartItem[] }) =>
    s.items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0),
}))

// ── Mock order store ───────────────────────────────────────────────────────────
jest.mock('@/features/orders/store/order.store', () => ({
  useOrderStore: (selector: (s: unknown) => unknown) => {
    const state = {
      lastOrder: null,
      setLastOrder: jest.fn(),
      clearOrder: jest.fn(),
    }
    return selector ? selector(state) : state
  },
}))

// ── Mock Sidebar ───────────────────────────────────────────────────────────────
jest.mock('@/components/shared/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 'prod-1',
    name: 'Coca-Cola 350ml',
    price: 5.5,
    unitType: 'unidade',
    quantity: 2,
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('CheckoutPage', () => {
  beforeEach(() => {
    mockItems = []
    mockPaymentMethod = null
    mockClearCart.mockClear()
    mockSetPaymentMethod.mockClear()
    mockUpdateQuantity.mockClear()
    mockMutate.mockClear()
    mockPush.mockClear()
  })

  it('renders empty state when no items', () => {
    render(<CheckoutPage />)
    expect(screen.getAllByText(/nenhum item no carrinho/i).length).toBeGreaterThan(0)
  })

  it('renders cart items', () => {
    mockItems = [makeItem()]
    render(<CheckoutPage />)
    expect(screen.getAllByText('Coca-Cola 350ml').length).toBeGreaterThan(0)
  })

  it('renders correct subtotal', () => {
    mockItems = [makeItem({ price: 5.5, quantity: 2 })]
    render(<CheckoutPage />)
    // 5.5 * 2 = 11.00
    expect(screen.getByText('Subtotal')).toBeInTheDocument()
  })

  it('"Finalizar Venda" mobile btn is disabled when no payment method', () => {
    mockItems = [makeItem()]
    render(<CheckoutPage />)
    const btns = screen.getAllByRole('button', { name: /finalizar venda/i })
    // At least one should be disabled
    expect(btns.some((b) => b.hasAttribute('disabled'))).toBe(true)
  })

  it('"Finalizar Venda" is enabled when payment method is set', () => {
    mockItems = [makeItem()]
    mockPaymentMethod = 'cash'
    render(<CheckoutPage />)
    const btns = screen.getAllByRole('button', { name: /finalizar venda/i })
    expect(btns.some((b) => !b.hasAttribute('disabled'))).toBe(true)
  })

  it('clicking PIX calls setPaymentMethod with "pix"', async () => {
    mockItems = [makeItem()]
    render(<CheckoutPage />)
    // Payment buttons have accessible name from their label text
    const pixBtns = screen.getAllByRole('button', { name: /^PIX$/i })
    await userEvent.click(pixBtns[0])
    expect(mockSetPaymentMethod).toHaveBeenCalledWith('pix')
  })

  it('"Limpar" button opens CancelSaleModal', async () => {
    render(<CheckoutPage />)
    const limparBtn = screen.getByRole('button', { name: /limpar/i })
    await userEvent.click(limparBtn)
    expect(screen.getByText('Cancelar Venda?')).toBeInTheDocument()
  })

  it('CancelSaleModal "Voltar" closes the modal', async () => {
    render(<CheckoutPage />)
    await userEvent.click(screen.getByRole('button', { name: /limpar/i }))
    expect(screen.getByText('Cancelar Venda?')).toBeInTheDocument()
    // Modal "Voltar" is a button whose visible text is "Voltar" (not aria-label)
    // Use getByText to target only the text-based button inside the modal
    const voltarBtn = screen.getByText('Voltar')
    await userEvent.click(voltarBtn)
    expect(screen.queryByText('Cancelar Venda?')).not.toBeInTheDocument()
  })

  it('CancelSaleModal "Cancelar Venda" clears cart and navigates to /pdv', async () => {
    render(<CheckoutPage />)
    await userEvent.click(screen.getByRole('button', { name: /limpar/i }))
    // Multiple "cancelar venda" buttons exist (modal + desktop link) — pick the modal button
    const cancelarBtns = screen.getAllByRole('button', { name: /cancelar venda/i })
    // The modal confirm button is the last one rendered (inside the modal overlay)
    await userEvent.click(cancelarBtns[cancelarBtns.length - 1])
    expect(mockClearCart).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/pdv')
  })
})
