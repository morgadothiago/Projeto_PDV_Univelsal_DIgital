export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: {
    page: number
    total: number
    limit: number
  }
}

export interface ApiError {
  success: false
  error: {
    message: string
    code: string
    statusCode: number
  }
}
