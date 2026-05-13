/**
 * ProductCard — RTL unit tests
 *
 * Coverage:
 *  - renders product name
 *  - renders formatted price
 *  - clicking card calls onAdd with the product
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from '../ProductCard'
import type { IProduct } from '../../interfaces/product.interface'

const mockProduct: IProduct = {
  id: 'prod-1',
  name: 'Coca-Cola 350ml',
  price: 5.0,
  unitType: 'unidade',
  categoryId: 'cat-1',
  categoryName: 'Bebidas',
  imageUrl: null,
  stock: 10,
  active: true,
}

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} onAdd={jest.fn()} />)
    expect(screen.getByText('Coca-Cola 350ml')).toBeInTheDocument()
  })

  it('renders formatted price', () => {
    render(<ProductCard product={mockProduct} onAdd={jest.fn()} />)
    // Use regex to handle locale-dependent non-breaking space between "R$" and "5,00"
    expect(screen.getByText(/R\$\s*5,00/)).toBeInTheDocument()
  })

  it('calls onAdd with the product when clicked', async () => {
    const onAdd = jest.fn()
    render(<ProductCard product={mockProduct} onAdd={onAdd} />)
    await userEvent.click(screen.getByRole('button', { name: /adicionar coca-cola/i }))
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledWith(mockProduct)
  })
})
