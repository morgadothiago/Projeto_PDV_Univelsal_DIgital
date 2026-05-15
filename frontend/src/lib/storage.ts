export const APP_STORAGE_KEYS = ['pdv-auth', 'pdv-tenant', 'pdv-cart'] as const

export function clearAllAppStorage() {
  if (typeof window === 'undefined') return
  APP_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
}

/** Clears everything except auth — used on same-browser user switch */
export function clearSessionStorage() {
  if (typeof window === 'undefined') return
  (['pdv-tenant', 'pdv-cart'] as const).forEach((key) => localStorage.removeItem(key))
}
