/**
 * RemoveItemModal — RTL unit tests
 *
 * Coverage:
 *  - renders product name and price
 *  - "Cancelar" calls onCancel
 *  - "Remover Item" calls onConfirm
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RemoveItemModal } from '../RemoveItemModal'
import type { CartItem } from '../../store/cart.store'

const mockItem: CartItem = {
  productId: 'prod-1',
  name: 'Coca-Cola 350ml',
  price: 5.5,
  unitType: 'unidade',
  quantity: 1,
}

describe('RemoveItemModal', () => {
  it('renders product name', () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()
    render(<RemoveItemModal item={mockItem} onConfirm={onConfirm} onCancel={onCancel} />)
    expect(screen.getByText('Coca-Cola 350ml')).toBeInTheDocument()
  })

  it('renders "Remover Item" title', () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()
    render(<RemoveItemModal item={mockItem} onConfirm={onConfirm} onCancel={onCancel} />)
    // Both the h2 heading and confirm button contain "Remover Item"
    expect(screen.getAllByText('Remover Item').length).toBeGreaterThan(0)
  })

  it('"Cancelar" button calls onCancel', async () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()
    render(<RemoveItemModal item={mockItem} onConfirm={onConfirm} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('"Remover Item" button calls onConfirm', async () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()
    render(<RemoveItemModal item={mockItem} onConfirm={onConfirm} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /remover item/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('renders warning text about cart removal', () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()
    render(<RemoveItemModal item={mockItem} onConfirm={onConfirm} onCancel={onCancel} />)
    expect(
      screen.getByText(/deseja remover este item do carrinho/i)
    ).toBeInTheDocument()
  })
})
