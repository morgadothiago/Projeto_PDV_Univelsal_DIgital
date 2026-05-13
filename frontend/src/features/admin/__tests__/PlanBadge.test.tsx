import { render, screen } from '@testing-library/react'
import { PlanBadge } from '../components/PlanBadge'

describe('PlanBadge', () => {
  it('renders "Pro" badge with purple styles', () => {
    render(<PlanBadge plan="pro" />)
    const badge = screen.getByText('Pro')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({ backgroundColor: '#FDF4FF', color: '#7C3AED' })
  })

  it('renders "Gratuito" badge with gray styles for free plan', () => {
    render(<PlanBadge plan="free" />)
    const badge = screen.getByText('Gratuito')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({ backgroundColor: '#F1F5F9', color: '#64748B' })
  })

  it('renders "Gratuito" for any non-pro plan value', () => {
    render(<PlanBadge plan="unknown" />)
    expect(screen.getByText('Gratuito')).toBeInTheDocument()
  })
})
