import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../components/StatusBadge'

describe('StatusBadge', () => {
  it('renders "Ativo" with correct styles for active status', () => {
    render(<StatusBadge status="active" />)
    const badge = screen.getByText('Ativo')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({ backgroundColor: '#DCFCE7', color: '#16A34A' })
  })

  it('renders "Suspenso" with correct styles for suspended status', () => {
    render(<StatusBadge status="suspended" />)
    const badge = screen.getByText('Suspenso')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({ backgroundColor: '#FEF2F2', color: '#DC2626' })
  })

  it('renders "Pendente" with correct styles for pending status', () => {
    render(<StatusBadge status="pending" />)
    const badge = screen.getByText('Pendente')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({ backgroundColor: '#FEF9C3', color: '#854D0E' })
  })

  it('falls back to active style for unknown status', () => {
    render(<StatusBadge status="unknown-status" />)
    const badge = screen.getByText('Ativo')
    expect(badge).toBeInTheDocument()
  })
})
