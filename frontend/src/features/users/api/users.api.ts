import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export interface IUser {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
}

export interface ICreateUserDto {
  name: string
  email: string
  password: string
  role: 'cashier'
}

export interface IUpdateUserDto {
  name?: string
  email?: string
  password?: string
}

export const usersApi = {
  findAll: async (): Promise<IUser[]> => {
    const res = await api.get<ApiResponse<IUser[]>>('/users')
    return res.data.data
  },

  create: async (dto: ICreateUserDto): Promise<IUser> => {
    const res = await api.post<ApiResponse<IUser>>('/users', dto)
    return res.data.data
  },

  update: async (id: string, dto: IUpdateUserDto): Promise<IUser> => {
    const res = await api.patch<ApiResponse<IUser>>(`/users/${id}`, dto)
    return res.data.data
  },

  softDelete: async (id: string): Promise<IUser> => {
    const res = await api.delete<ApiResponse<IUser>>(`/users/${id}`)
    return res.data.data
  },
}
