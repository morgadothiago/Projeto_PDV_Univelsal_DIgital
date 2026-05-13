import { render, screen } from '@testing-library/react'
import { DollarSign } from 'lucide-react'
import { KPICardDesktop } from '../components/KPICardDesktop'

const defaultProps = {
  icon: DollarSign,
  iconColor: '#16A34A',
  iconBg: '#F0FDF4',
  value: 'R$ 1.250',
  label: 'Faturamento',
}

describe('KPICardDesktop', () => {
  it('renders value and label', () => {
    render(<KPICardDesktop {...defaultProps} />)
    expect(screen.getByText('R$ 1.250')).toBeInTheDocument()
    expect(screen.getByText('Faturamento')).toBeInTheDocument()
  })

  it('renders delta when provided', () => {
    render(<KPICardDesktop {...defaultProps} delta="+8%" deltaPositive />)
    expect(screen.getByText('+8%')).toBeInTheDocument()
  })

  it('does not render delta text when not provided', () => {
    render(<KPICardDesktop {...defaultProps} />)
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { asFragment } = render(<KPICardDesktop {...defaultProps} delta="+8%" deltaPositive />)
    expect(asFragment()).toMatchSnapshot()
  })
})
