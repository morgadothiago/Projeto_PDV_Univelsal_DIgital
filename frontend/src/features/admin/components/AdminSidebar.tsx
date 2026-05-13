'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Shield, Store, Users, CreditCard, Settings, LogOut, type LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'

interface NavItem {
  label: string
  icon: LucideIcon
  href: string
  matchPrefix: string
  disabled?: boolean
}

const navItems: NavItem[] = [
  { label: 'Lojas', icon: Store, href: '/admin/lojas', matchPrefix: '/admin/lojas' },
  { label: 'Usuários', icon: Users, href: '#', matchPrefix: '/admin/usuarios', disabled: true },
  { label: 'Planos', icon: CreditCard, href: '/admin/planos', matchPrefix: '/admin/planos' },
  { label: 'Configurações', icon: Settings, href: '/admin/configuracoes', matchPrefix: '/admin/configuracoes' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, clearAuth } = useAuthStore()

  function handleLogout() {
    clearAuth()
    router.replace('/login')
  }

  return (
    <aside
      className="flex flex-col h-screen flex-shrink-0"
      style={{ width: '240px', backgroundColor: '#020617' }}
    >
      {/* Logo */}
      <div
        className="flex items-center"
        style={{ gap: '12px', padding: '0 20px 24px 20px' }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#7C3AED',
          }}
        >
          <Shield size={18} color="#FFFFFF" />
        </div>
        <div className="flex flex-col">
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              lineHeight: '1.2',
            }}
          >
            PDV Universal
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 400,
              color: '#A78BFA',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Super Admin
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#1E1B4B', width: '100%' }} />

      {/* Nav */}
      <nav
        className="flex flex-col"
        style={{ gap: '4px', padding: '16px 12px', flex: 1 }}
      >
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.matchPrefix)

          if (item.disabled) {
            return (
              <div
                key={item.label}
                className="flex items-center"
                style={{
                  gap: '10px',
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  cursor: 'not-allowed',
                  opacity: 0.5,
                }}
              >
                <item.icon size={16} color="#6B7280" />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#6B7280',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {item.label}
                </span>
              </div>
            )
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center no-underline"
              style={{
                gap: '10px',
                height: '40px',
                padding: '0 12px',
                borderRadius: '8px',
                backgroundColor: isActive ? '#3B1F8C' : 'transparent',
                textDecoration: 'none',
              }}
            >
              <item.icon
                size={16}
                color={isActive ? '#C4B5FD' : '#6B7280'}
                style={{ flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#FFFFFF' : '#6B7280',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className="flex items-center"
        style={{
          borderTop: '1px solid #1E1B4B',
          padding: '12px 16px 0 16px',
          gap: '10px',
          paddingBottom: '16px',
        }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '18px',
            backgroundColor: '#3B1F8C',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#C4B5FD',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            SA
          </span>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Super Admin
          </span>
          <span
            className="truncate"
            style={{
              fontSize: '10px',
              color: '#6B7280',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {user?.email ?? ''}
          </span>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Sair"
          title="Sair"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            color: '#6B7280',
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
