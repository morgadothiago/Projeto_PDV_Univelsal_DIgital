import axios from 'axios'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL is required')

function getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
  try {
    const auth = localStorage.getItem('pdv-auth')
    if (!auth) return { accessToken: null, refreshToken: null }
    const parsed = JSON.parse(auth) as { state?: { token?: string; refreshToken?: string } }
    return {
      accessToken: parsed?.state?.token ?? null,
      refreshToken: parsed?.state?.refreshToken ?? null,
    }
  } catch (err) {
    console.warn('[axios] Failed to parse stored auth state:', err)
    return { accessToken: null, refreshToken: null }
  }
}

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const { accessToken } = getStoredTokens()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window === 'undefined') {
        return Promise.reject(error)
      }

      const { refreshToken } = getStoredTokens()

      if (!refreshToken) {
        toast.error('Sessão expirada. Faça login novamente.')
        localStorage.removeItem('pdv-auth')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const res = await axios.post<{ data: { accessToken: string } }>(
          `${API_URL}/auth/refresh`,
          { refreshToken }
        )
        const newToken = res.data.data.accessToken

        // Update the persisted Zustand state in localStorage with the new token
        const currentRaw = localStorage.getItem('pdv-auth')
        if (currentRaw) {
          try {
            const parsed = JSON.parse(currentRaw) as { state?: Record<string, unknown>; version?: number }
            if (parsed.state) {
              parsed.state.token = newToken
              localStorage.setItem('pdv-auth', JSON.stringify(parsed))
            }
          } catch (err) {
            console.warn('[axios] Failed to update stored token after refresh:', err)
          }
        }

        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        toast.error('Sessão expirada. Faça login novamente.')
        localStorage.removeItem('pdv-auth')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
