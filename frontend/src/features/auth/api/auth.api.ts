import { api } from '@/lib/axios'
import type { ILoginRequest, ILoginResponse } from '../interfaces/auth.interface'
import type { ApiResponse } from '@/types/api.types'

export const authApi = {
  login: async (data: ILoginRequest): Promise<ILoginResponse> => {
    const res = await api.post<ApiResponse<ILoginResponse>>('/auth/login', data)
    if (!res.data?.data) throw new Error('Invalid response from server')
    return res.data.data
  },

  register: async (data: {
    storeName: string
    storeType: string
    ownerName: string
    email: string
    password: string
  }): Promise<ILoginResponse> => {
    const res = await api.post<ApiResponse<ILoginResponse>>('/auth/register', data)
    if (!res.data?.data) throw new Error('Invalid response from server')
    return res.data.data
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email })
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword })
  },
}
