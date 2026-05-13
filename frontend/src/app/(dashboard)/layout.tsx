'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { MobileBottomNav } from '@/features/dashboard/components/MobileBottomNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, _hasHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (_hasHydrated && !user) router.replace('/login')
  }, [_hasHydrated, user, router])

  // Aguarda hidratação do Zustand antes de qualquer decisão
  if (!_hasHydrated) return null

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {children}
      <MobileBottomNav />
    </div>
  )
}
