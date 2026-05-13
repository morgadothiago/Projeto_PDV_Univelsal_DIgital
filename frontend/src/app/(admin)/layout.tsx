'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { AdminSidebar } from '@/features/admin/components/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, _hasHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (_hasHydrated && (!user || user.role !== 'super_admin')) {
      router.replace('/login')
    }
  }, [_hasHydrated, user, router])

  // Aguarda hidratação do Zustand antes de qualquer decisão
  if (!_hasHydrated) return null

  if (!user || user.role !== 'super_admin') return null

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  )
}
