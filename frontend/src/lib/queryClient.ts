import axios from 'axios'
import { QueryClient } from '@tanstack/react-query'
import { handleApiError } from './api-error'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 60 s — POS inventory changes frequently
      // Do not retry on 4xx client errors — only on network/5xx failures
      retry: (failureCount, err) => {
        if (axios.isAxiosError(err) && err.response?.status && err.response.status < 500) {
          return false
        }
        return failureCount < 2
      },
    },
    mutations: {
      onError: (err) => handleApiError(err),
    },
  },
})
