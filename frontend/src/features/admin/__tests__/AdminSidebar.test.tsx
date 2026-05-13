import { render, screen } from '@testing-library/react'
import { AdminSidebar } from '../components/AdminSidebar'

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/admin/lojas'),
}))

// Mock the auth store
jest.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: jest.fn(() => ({
    user: { email: 'admin@test.com', role: 'super_admin' },
  })),
}))

// Mock Next.js Link
jest.mock('next/link', () => {
  const MockLink = ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('AdminSidebar', () => {
  it('renders the brand name and role label', () => {
    render(<AdminSidebar />)
    expect(screen.getByText('PDV Universal')).toBeInTheDocument()
    // "Super Admin" appears in the logo subtitle and in the footer — both expected
    const superAdminElements = screen.getAllByText('Super Admin')
    expect(superAdminElements.length).toBeGreaterThanOrEqual(1)
  })

  it('renders all navigation items', () => {
    render(<AdminSidebar />)
    expect(screen.getByText('Lojas')).toBeInTheDocument()
    expect(screen.getByText('Usuários')).toBeInTheDocument()
    expect(screen.getByText('Planos')).toBeInTheDocument()
    expect(screen.getByText('Configurações')).toBeInTheDocument()
  })

  it('highlights the active nav item based on current path', () => {
    render(<AdminSidebar />)
    // "Lojas" link should be active (pathname is /admin/lojas)
    const lojasLink = screen.getByText('Lojas').closest('a')
    expect(lojasLink).toHaveStyle({ backgroundColor: '#3B1F8C' })
  })

  it('displays the user email in the footer', () => {
    render(<AdminSidebar />)
    expect(screen.getByText('admin@test.com')).toBeInTheDocument()
  })

  it('renders "SA" avatar initials', () => {
    render(<AdminSidebar />)
    expect(screen.getByText('SA')).toBeInTheDocument()
  })
})
