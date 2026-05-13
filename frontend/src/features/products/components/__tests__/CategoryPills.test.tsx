/**
 * CategoryPills — RTL unit tests
 *
 * Coverage:
 *  - renders "Todos" pill always
 *  - renders passed categories
 *  - "Todos" is active when activeId is null
 *  - clicking a pill calls onSelect with correct id
 *  - clicking "Todos" calls onSelect with null
 *  - active pill has correct aria-selected
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryPills } from '../CategoryPills'
import type { ICategory } from '../../interfaces/product.interface'

const categories: ICategory[] = [
  { id: 'cat-1', name: 'Alimentação' },
  { id: 'cat-2', name: 'Bebidas' },
]

describe('CategoryPills', () => {
  it('always renders "Todos" pill', () => {
    render(<CategoryPills categories={[]} activeId={null} onSelect={jest.fn()} />)
    expect(screen.getByRole('tab', { name: 'Todos' })).toBeInTheDocument()
  })

  it('renders all passed categories', () => {
    render(<CategoryPills categories={categories} activeId={null} onSelect={jest.fn()} />)
    expect(screen.getByRole('tab', { name: 'Alimentação' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Bebidas' })).toBeInTheDocument()
  })

  it('"Todos" pill is aria-selected when activeId is null', () => {
    render(<CategoryPills categories={categories} activeId={null} onSelect={jest.fn()} />)
    expect(screen.getByRole('tab', { name: 'Todos' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Alimentação' })).toHaveAttribute('aria-selected', 'false')
  })

  it('selected category pill is aria-selected', () => {
    render(<CategoryPills categories={categories} activeId="cat-1" onSelect={jest.fn()} />)
    expect(screen.getByRole('tab', { name: 'Alimentação' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Todos' })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onSelect with category id when category pill is clicked', async () => {
    const onSelect = jest.fn()
    render(<CategoryPills categories={categories} activeId={null} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Bebidas' }))
    expect(onSelect).toHaveBeenCalledWith('cat-2')
  })

  it('calls onSelect with null when "Todos" pill is clicked', async () => {
    const onSelect = jest.fn()
    render(<CategoryPills categories={categories} activeId="cat-1" onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Todos' }))
    expect(onSelect).toHaveBeenCalledWith(null)
  })
})
