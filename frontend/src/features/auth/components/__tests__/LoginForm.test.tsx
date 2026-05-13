/**
 * LoginForm — RTL unit tests
 *
 * Strategy: mock authApi directly (avoids MSW ESM incompatibility with Jest/jsdom).
 * The API integration layer is tested separately via MSW in integration/e2e tests.
 *
 * Coverage:
 *  - renders email + password fields
 *  - validation: invalid email, short password
 *  - calls authApi.login with correct data on valid submit
 *  - button is disabled while loading
 *  - shows "Credenciais inválidas" on 401
 *  - redirects store_owner → /dashboard, cashier → /pdv, super_admin → /admin
 *  - calls setAuth with token and user on success
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginForm } from '../LoginForm'

// ── Module mocks ──────────────────────────────────────────────────────────────

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockSetAuth = jest.fn()
jest.mock('@/features/auth/store/auth.store', () => ({
  useAuthStore: () => ({ setAuth: mockSetAuth }),
}))

const mockLogin = jest.fn()
jest.mock('@/features/auth/api/auth.api', () => ({
  authApi: { login: (...args: unknown[]) => mockLogin(...args) },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function renderForm() {
  return render(
    <QueryClientProvider client={makeQueryClient()}>
      <LoginForm />
    </QueryClientProvider>
  )
}

const getEmail = () => screen.getByLabelText('E-mail')
const getPassword = () => screen.getByLabelText('Senha')
const getSubmitBtn = () => screen.getByRole('button', { name: /entrar/i })

async function fillAndSubmit(email: string, password: string) {
  await userEvent.type(getEmail(), email)
  await userEvent.type(getPassword(), password)
  await userEvent.click(getSubmitBtn())
}

function makeUser(role: string) {
  return { id: '1', tenantId: 'tenant-1', email: 'user@test.com', name: 'User', role }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LoginForm', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockSetAuth.mockClear()
    mockLogin.mockClear()
  })

  it('renders email and password fields', () => {
    renderForm()
    expect(getEmail()).toBeInTheDocument()
    expect(getPassword()).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    renderForm()
    expect(getSubmitBtn()).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    renderForm()
    await userEvent.type(getEmail(), 'not-an-email')
    await userEvent.click(getSubmitBtn())
    expect(await screen.findByText('E-mail inválido')).toBeInTheDocument()
  })

  it('shows validation error for short password', async () => {
    renderForm()
    await userEvent.type(getEmail(), 'valid@email.com')
    await userEvent.type(getPassword(), '123')
    await userEvent.click(getSubmitBtn())
    expect(await screen.findByText('Mínimo 6 caracteres')).toBeInTheDocument()
  })

  it('does not call authApi.login when form is invalid', async () => {
    renderForm()
    await userEvent.click(getSubmitBtn())
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('calls authApi.login with email and password on valid submit', async () => {
    mockLogin.mockResolvedValueOnce({ accessToken: 'tok', user: makeUser('store_owner') })
    renderForm()
    await fillAndSubmit('user@test.com', 'password123')
    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith({ email: 'user@test.com', password: 'password123' })
    )
  })

  it('button is disabled while mutation is pending', async () => {
    // Never resolves — stays in pending state
    mockLogin.mockReturnValueOnce(new Promise(() => {}))
    renderForm()
    await fillAndSubmit('user@test.com', 'password123')
    await waitFor(() => expect(getSubmitBtn()).toBeDisabled())
  })

  it('redirects store_owner to /dashboard after success', async () => {
    mockLogin.mockResolvedValueOnce({ accessToken: 'tok', user: makeUser('store_owner') })
    renderForm()
    await fillAndSubmit('user@test.com', 'password123')
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'))
  })

  it('redirects cashier to /pdv after success', async () => {
    mockLogin.mockResolvedValueOnce({ accessToken: 'tok', user: makeUser('cashier') })
    renderForm()
    await fillAndSubmit('user@test.com', 'password123')
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/pdv'))
  })

  it('redirects super_admin to /admin after success', async () => {
    mockLogin.mockResolvedValueOnce({ accessToken: 'tok', user: makeUser('super_admin') })
    renderForm()
    await fillAndSubmit('user@test.com', 'password123')
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/admin'))
  })

  it('calls setAuth with token and user on success', async () => {
    const user = makeUser('store_owner')
    mockLogin.mockResolvedValueOnce({ accessToken: 'mock-jwt', user })
    renderForm()
    await fillAndSubmit('user@test.com', 'password123')
    await waitFor(() => expect(mockSetAuth).toHaveBeenCalledWith('mock-jwt', user))
  })

  it('shows "Credenciais inválidas" on 401 error', async () => {
    const error = Object.assign(new Error('Unauthorized'), {
      response: { status: 401, data: { error: { message: 'Unauthorized' } } },
    })
    mockLogin.mockRejectedValueOnce(error)
    renderForm()
    await fillAndSubmit('user@test.com', 'wrongpassword')
    expect(await screen.findByText('Credenciais inválidas')).toBeInTheDocument()
  })

  it('shows generic error message on non-401 API error', async () => {
    const error = Object.assign(new Error('Server Error'), {
      response: { status: 500, data: { error: { message: 'Internal Server Error' } } },
    })
    mockLogin.mockRejectedValueOnce(error)
    renderForm()
    await fillAndSubmit('user@test.com', 'password123')
    expect(await screen.findByText('Internal Server Error')).toBeInTheDocument()
  })

  it('toggles password visibility when eye icon is clicked', async () => {
    renderForm()
    const passwordInput = getPassword()
    expect(passwordInput).toHaveAttribute('type', 'password')
    const toggleBtn = screen.getByRole('button', { name: /mostrar senha/i })
    await userEvent.click(toggleBtn)
    expect(passwordInput).toHaveAttribute('type', 'text')
    const hideBtn = screen.getByRole('button', { name: /ocultar senha/i })
    await userEvent.click(hideBtn)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
