/**
 * UsuariosPage — RTL unit tests
 *
 * Strategy: mock usersApi and TanStack Query to avoid MSW/ESM issues.
 *
 * Coverage:
 *  - renders heading
 *  - renders "Novo" button
 *  - shows skeleton loaders while loading
 *  - shows empty state when no users
 *  - renders user cards with name and email
 *  - shows "Ativo" badge for active users
 *  - shows "Inativo" badge for inactive users
 *  - opens the new-user sheet when "Novo" is clicked
 *  - closes the sheet when close button is clicked
 *  - submit button disabled when fields empty
 *  - shows error when creation fails
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UsuariosPage from '../page'
import type { IUser } from '@/features/users/api/users.api'

// ── Mock next/navigation ──────────────────────────────────────────────────────
jest.mock('next/navigation', () => ({
  usePathname: () => '/usuarios',
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
    name: 'Maria Silva',
    email: 'maria@loja.com',
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
      <UsuariosPage />
    </QueryClientProvider>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('UsuariosPage', () => {
  beforeEach(() => {
    mockFindAll.mockClear()
    mockCreate.mockClear()
  })

  it('renders the page heading', async () => {
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
    mockFindAll.mockReturnValueOnce(new Promise(() => {}))
    const { container } = renderPage()
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows empty state when no users returned', async () => {
    mockFindAll.mockResolvedValueOnce([])
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Nenhum caixeiro cadastrado')).toBeInTheDocument()
    )
  })

  it('renders a user card with name and email', async () => {
    mockFindAll.mockResolvedValueOnce([makeUser()])
    renderPage()
    await waitFor(() => expect(screen.getByText('Maria Silva')).toBeInTheDocument())
    expect(screen.getByText('maria@loja.com')).toBeInTheDocument()
  })

  it('renders two-letter initials in avatar', async () => {
    mockFindAll.mockResolvedValueOnce([makeUser()])
    renderPage()
    await waitFor(() => expect(screen.getByText('MS')).toBeInTheDocument())
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

  it('opens the sheet when "Novo" button is clicked', async () => {
    mockFindAll.mockResolvedValueOnce([])
    renderPage()
    await userEvent.click(screen.getByText('Novo'))
    expect(screen.getByText('Novo Usuário')).toBeInTheDocument()
  })

  it('closes the sheet when the close button is clicked', async () => {
    mockFindAll.mockResolvedValueOnce([])
    renderPage()
    await userEvent.click(screen.getByText('Novo'))
    await userEvent.click(screen.getByRole('button', { name: /fechar/i }))
    await waitFor(() =>
      expect(screen.queryByText('Novo Usuário')).not.toBeInTheDocument()
    )
  })

  it('submit button is disabled when fields are empty', async () => {
    mockFindAll.mockResolvedValueOnce([])
    renderPage()
    await userEvent.click(screen.getByText('Novo'))
    expect(screen.getByText('Criar Usuário')).toBeDisabled()
  })

  it('shows error message when creation fails', async () => {
    mockFindAll.mockResolvedValueOnce([])
    mockCreate.mockRejectedValueOnce(new Error('Conflict'))
    renderPage()
    await userEvent.click(screen.getByText('Novo'))
    await userEvent.type(screen.getByPlaceholderText('Nome completo'), 'Ana Lima')
    await userEvent.type(screen.getByPlaceholderText('email@exemplo.com'), 'ana@loja.com')
    await userEvent.type(screen.getByPlaceholderText('Senha de acesso'), 'senha123')
    await userEvent.click(screen.getByText('Criar Usuário'))
    await waitFor(() =>
      expect(
        screen.getByText('Erro ao criar usuário. Verifique os dados.')
      ).toBeInTheDocument()
    )
  })
})
