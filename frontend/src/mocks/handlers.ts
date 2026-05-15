import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'}/auth/login`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'mock-jwt-token',
        user: {
          id: '1',
          tenantId: 'tenant-1',
          email: 'test@test.com',
          name: 'Test User',
          role: 'store_owner',
        },
      },
    })
  }),
]
