/**
 * CancelSaleModal — RTL unit tests
 *
 * Coverage:
 *  - renders modal title and description
 *  - "Voltar" calls onCancel
 *  - "Cancelar Venda" calls onConfirm
 *  - stock restore note is shown
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CancelSaleModal } from '../CancelSaleModal'

describe('CancelSaleModal', () => {
  it('renders "Cancelar Venda?" title', () => {
    render(<CancelSaleModal onConfirm={jest.fn()} onCancel={jest.fn()} />)
    expect(screen.getByText('Cancelar Venda?')).toBeInTheDocument()
  })

  it('shows irrecoverable action description', () => {
    render(<CancelSaleModal onConfirm={jest.fn()} onCancel={jest.fn()} />)
    expect(screen.getByText(/esta ação não pode ser desfeita/i)).toBeInTheDocument()
  })

  it('shows stock restore note', () => {
    render(<CancelSaleModal onConfirm={jest.fn()} onCancel={jest.fn()} />)
    expect(screen.getByText(/estoque será restaurado/i)).toBeInTheDocument()
  })

  it('"Voltar" button calls onCancel', async () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()
    render(<CancelSaleModal onConfirm={onConfirm} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /voltar/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('"Cancelar Venda" button calls onConfirm', async () => {
    const onConfirm = jest.fn()
    const onCancel = jest.fn()
    render(<CancelSaleModal onConfirm={onConfirm} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar venda/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })
})
