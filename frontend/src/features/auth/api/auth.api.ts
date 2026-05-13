import { api } from '@/lib/axios'
import type { ILoginRequest, ILoginResponse } from '../interfaces/auth.interface'
import type { ApiResponse } from '@/types/api.types'

export const authApi = {
  login: async (data: ILoginRequest): Promise<ILoginResponse> => {
    const res = await api.post<ApiResponse<ILoginResponse>>('/auth/login', data)
    return res.data.data
  },
}
