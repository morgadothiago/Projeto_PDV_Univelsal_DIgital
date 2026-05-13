/**
 * CartPanel — RTL unit tests
 *
 * Strategy: mock useCartStore directly (avoids MSW ESM incompatibility).
 *
 * Coverage:
 *  - shows empty state when no items
 *  - renders cart items
 *  - shows correct total in footer
 *  - "Finalizar Venda" button is disabled when cart is empty
 *  - "Finalizar Venda" button is disabled when no payment method selected
 *  - "Finalizar Venda" button is enabled when items + payment method set
 *  - "Limpar" calls clearCart
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartPanel } from '../CartPanel'
import type { CartItem } from '../../store/cart.store'

// ── Mock cart store ───────────────────────────────────────────────────────────

const mockClearCart = jest.fn()
const mockSetPaymentMethod = jest.fn()
const mockUpdateQuantity = jest.fn()
const mockRemoveItem = jest.fn()

let mockItems: CartItem[] = []
let mockPaymentMethod: 'pix' | 'cash' | 'card' | null = null

jest.mock('../../store/cart.store', () => ({
  useCartStore: (selector: (s: unknown) => unknown) => {
    const state = {
      items: mockItems,
      paymentMethod: mockPaymentMethod,
      clearCart: mockClearCart,
      setPaymentMethod: mockSetPaymentMethod,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    }
    return selector ? selector(state) : state
  },
  selectTotal: (s: { items: CartItem[] }) =>
    s.items.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0),
  selectItemCount: (s: { items: CartItem[] }) =>
    s.items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0),
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

describe('CartPanel', () => {
  beforeEach(() => {
    mockItems = []
    mockPaymentMethod = null
    mockClearCart.mockClear()
    mockSetPaymentMethod.mockClear()
    mockUpdateQuantity.mockClear()
    mockRemoveItem.mockClear()
  })

  it('shows empty state message when no items', () => {
    render(<CartPanel />)
    expect(screen.getByText(/nenhum produto no carrinho/i)).toBeInTheDocument()
  })

  it('renders cart items when present', () => {
    mockItems = [makeItem()]
    render(<CartPanel />)
    expect(screen.getByText('Coca-Cola 350ml')).toBeInTheDocument()
  })

  it('shows correct total in the footer (price * quantity)', () => {
    mockItems = [makeItem({ price: 5.5, quantity: 2 })]
    render(<CartPanel />)
    // Footer subtotal row: "Subtotal" label sibling
    const subtotalLabel = screen.getByText('Subtotal')
    const footerRow = subtotalLabel.closest('div')
    // The value sibling within same row
    expect(footerRow).toHaveTextContent(/R\$\s*11,00/)
  })

  it('"Finalizar Venda" is disabled when cart is empty', () => {
    render(<CartPanel />)
    expect(screen.getByRole('button', { name: /finalizar venda/i })).toBeDisabled()
  })

  it('"Finalizar Venda" is disabled when items present but no payment method', () => {
    mockItems = [makeItem()]
    render(<CartPanel />)
    expect(screen.getByRole('button', { name: /finalizar venda/i })).toBeDisabled()
  })

  it('"Finalizar Venda" is enabled when items present AND payment method set', () => {
    mockItems = [makeItem()]
    mockPaymentMethod = 'pix'
    render(<CartPanel />)
    expect(screen.getByRole('button', { name: /finalizar venda/i })).not.toBeDisabled()
  })

  it('calls clearCart when "Limpar" is clicked', async () => {
    render(<CartPanel />)
    await userEvent.click(screen.getByRole('button', { name: /limpar carrinho/i }))
    expect(mockClearCart).toHaveBeenCalledTimes(1)
  })
})
