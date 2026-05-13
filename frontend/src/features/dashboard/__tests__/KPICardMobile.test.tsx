import { render, screen } from '@testing-library/react'
import { ShoppingBag } from 'lucide-react'
import { KPICardMobile } from '../components/KPICardMobile'

const defaultProps = {
  icon: ShoppingBag,
  iconColor: '#2563EB',
  iconBg: '#EFF6FF',
  value: '42',
  label: 'Vendas hoje',
}

describe('KPICardMobile', () => {
  it('renders value and label', () => {
    render(<KPICardMobile {...defaultProps} />)
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Vendas hoje')).toBeInTheDocument()
  })

  it('renders delta when provided', () => {
    render(<KPICardMobile {...defaultProps} delta="+15%" deltaPositive />)
    expect(screen.getByText('+15%')).toBeInTheDocument()
  })

  it('does not render delta when not provided', () => {
    render(<KPICardMobile {...defaultProps} />)
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { asFragment } = render(<KPICardMobile {...defaultProps} delta="+10%" deltaPositive />)
    expect(asFragment()).toMatchSnapshot()
  })
})
