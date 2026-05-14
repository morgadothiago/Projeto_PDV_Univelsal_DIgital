import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL is required')

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('pdv-auth')
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { state?: { token?: string } }
        const token = parsed?.state?.token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch {
        // ignore parse errors
      }
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

      const raw = localStorage.getItem('pdv-auth')
      let refreshToken: string | null = null
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as { state?: { refreshToken?: string } }
          refreshToken = parsed?.state?.refreshToken ?? null
        } catch {
          // ignore
        }
      }

      if (!refreshToken) {
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

        // Update localStorage directly
        const raw2 = localStorage.getItem('pdv-auth')
        if (raw2) {
          try {
            const parsed = JSON.parse(raw2) as { state?: Record<string, unknown>; version?: number }
            if (parsed.state) {
              parsed.state.token = newToken
              localStorage.setItem('pdv-auth', JSON.stringify(parsed))
            }
          } catch {
            // ignore
          }
        }

        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
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
