import axios from 'axios'
import { toast } from 'sonner'

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    const serverMessage =
      err.response?.data?.error?.message ?? err.response?.data?.message

    // Use server message if it's a non-empty string (backend sends Portuguese messages)
    if (typeof serverMessage === 'string' && serverMessage.length > 0) {
      return serverMessage
    }

    // Fallback by status code
    switch (status) {
      case 400:
        return 'Dados inválidos. Verifique as informações e tente novamente.'
      case 401:
        return 'Sessão expirada. Faça login novamente.'
      case 403:
        return 'Sem permissão para realizar esta ação.'
      case 404:
        return 'Recurso não encontrado.'
      case 409:
        return 'Este registro já existe.'
      case 422:
        return 'Dados inválidos.'
      case 429:
        return 'Muitas tentativas. Aguarde um momento.'
      case 500:
        return 'Erro interno do servidor. Tente novamente.'
      case 502:
      case 503:
        return 'Serviço temporariamente indisponível.'
      default:
        return 'Ocorreu um erro inesperado.'
    }
  }
  if (err instanceof Error) return err.message
  return 'Ocorreu um erro inesperado.'
}

export function handleApiError(err: unknown, fallback?: string): void {
  const message = fallback ?? getApiErrorMessage(err)
  toast.error(message)
}
