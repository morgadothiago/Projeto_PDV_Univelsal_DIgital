/**
 * CaixeirosPage — RTL unit tests
 *
 * Strategy: mock usersApi and TanStack Query to avoid MSW/ESM issues.
 *
 * Coverage:
 *  - renders "Caixeiros" heading
 *  - renders "Novo" button
 *  - shows skeleton loaders while loading
 *  - shows empty state when no users
 *  - renders user cards with name and email
 *  - shows "Ativo" badge for active users
 *  - shows "Inativo" badge for inactive users
 *  - opens the new-user sheet when "Novo" is clicked
 *  - closes the sheet when close button is clicked
 *  - shows error message when creation fails
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CaixeirosPage from '../page'
import type { IUser } from '@/features/users/api/users.api'

// ── Mock next/navigation ──────────────────────────────────────────────────────
jest.mock('next/navigation', () => ({
  usePathname: () => '/caixeiros',
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}))

// ── Mock auth store ───────────────────────────────────────────────────────────
jest.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: () => ({
    user: { id: '1', name: 'Thiago M', role: 'store_owner', tenantId: 't1' },
    clearAuth: jest.fn(),
  }),
}))

// ── Mock DashboardSidebar ─────────────────────────────────────────────────────
jest.mock('@/features/dashboard/components/DashboardSidebar', () => ({
  DashboardSidebar: () => <nav data-testid="sidebar" />,
}))

// ── Mock usersApi ─────────────────────────────────────────────────────────────
const mockFindAll = jest.fn()
const mockCreate = jest.fn()

jest.mock('@/features/users/api/users.api', () => ({
  usersApi: {
    findAll: (...args: unknown[]) => mockFindAll(...args),
    create: (...args: unknown[]) => mockCreate(...args),
  },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<IUser> = {}): IUser {
  return {
    id: 'user-1',
    name: 'Carlos Andrade',
    email: 'carlos@loja.com',
    role: 'cashier',
    isActive: true,
    ...overrides,
  }
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function renderPage() {
  return render(
    <QueryClientProvider client={makeQueryClient()}>
      <CaixeirosPage />
    </QueryClientProvider>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CaixeirosPage', () => {
  beforeEach(() => {
    mockFindAll.mockClear()
    mockCreate.mockClear()
  })

  it('renders the page heading "Caixeiros"', async () => {
    mockFindAll.mockResolvedValueOnce([])
    renderPage()
    expect(screen.getByText('Caixeiros')).toBeInTheDocument()
  })

  it('renders the "Novo" button', async () => {
    mockFindAll.mockResolvedValueOnce([])
    renderPage()
    expect(screen.getByText('Novo')).toBeInTheDocument()
  })

  it('shows skeleton loaders while loading', () => {
    // never resolves — stays loading
    mockFindAll.mockReturnValueOnce(new Promise(() => {}))
    const { container } = renderPage()
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows empty state when no users', async () => {
    mockFindAll.mockResolvedValueOnce([])
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Nenhum caixeiro cadastrado')).toBeInTheDocument()
    )
  })

  it('renders user card with name and email', async () => {
    mockFindAll.mockResolvedValueOnce([makeUser()])
    renderPage()
    await waitFor(() => expect(screen.getByText('Carlos Andrade')).toBeInTheDocument())
    expect(screen.getByText('carlos@loja.com')).toBeInTheDocument()
  })

  it('renders initials in avatar circle', async () => {
    mockFindAll.mockResolvedValueOnce([makeUser()])
    renderPage()
    await waitFor(() => expect(screen.getByText('CA')).toBeInTheDocument())
  })

  it('shows "Ativo" badge for active users', async () => {
    mockFindAll.mockResolvedValueOnce([makeUser({ isActive: true })])
    renderPage()
    await waitFor(() => expect(screen.getByText('Ativo')).toBeInTheDocument())
  })

  it('shows "Inativo" badge for inactive users', async () => {
    mockFindAll.mockResolvedValueOnce([makeUser({ isActive: false })])
    renderPage()
    await waitFor(() => expect(screen.getByText('Inativo')).toBeInTheDocument())
  })

  it('opens the novo-caixeiro sheet when "Novo" is clicked', async () => {
    mockFindAll.mockResolvedValueOnce([])
    renderPage()
    await userEvent.click(screen.getByText('Novo'))
    expect(screen.getByText('Novo Caixeiro')).toBeInTheDocument()
  })

  it('closes the sheet when the close button is clicked', async () => {
    mockFindAll.mockResolvedValueOnce([])
    renderPage()
    await userEvent.click(screen.getByText('Novo'))
    expect(screen.getByText('Novo Caixeiro')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /fechar/i }))
    await waitFor(() =>
      expect(screen.queryByText('Novo Caixeiro')).not.toBeInTheDocument()
    )
  })

  it('submit button is disabled when fields are empty', async () => {
    mockFindAll.mockResolvedValueOnce([])
    renderPage()
    await userEvent.click(screen.getByText('Novo'))
    const submitBtn = screen.getByText('Criar Caixeiro')
    expect(submitBtn).toBeDisabled()
  })

  it('shows error when creation fails', async () => {
    mockFindAll.mockResolvedValueOnce([])
    mockCreate.mockRejectedValueOnce(new Error('Conflict'))
    renderPage()
    await userEvent.click(screen.getByText('Novo'))
    await userEvent.type(screen.getByPlaceholderText('Nome completo'), 'Ana Lima')
    await userEvent.type(screen.getByPlaceholderText('email@exemplo.com'), 'ana@loja.com')
    await userEvent.type(screen.getByPlaceholderText('Senha de acesso'), 'senha123')
    await userEvent.click(screen.getByText('Criar Caixeiro'))
    await waitFor(() =>
      expect(
        screen.getByText('Erro ao criar caixeiro. Verifique os dados.')
      ).toBeInTheDocument()
    )
  })
})
