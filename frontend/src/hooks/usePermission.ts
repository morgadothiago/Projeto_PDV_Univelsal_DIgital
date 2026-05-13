import { useCurrentUser } from './useCurrentUser'
import type { Role } from '@/types/roles.types'

export function usePermission(allowedRoles: Role[]): boolean {
  const user = useCurrentUser()
  if (!user) return false
  return allowedRoles.includes(user.role)
}
