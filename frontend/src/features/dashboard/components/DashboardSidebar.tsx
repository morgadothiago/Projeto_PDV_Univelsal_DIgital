'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Tag,
  Archive,
  Users,
  BarChart2,
  ClipboardList,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useTenantStore } from '@/store/useTenantStore'
import { useOrderNotifications } from '@/features/orders/hooks/useOrderNotifications'
import { useNotificationStore } from '@/features/orders/store/notificationStore'

interface NavItem {
  label: string
  icon: LucideIcon
  href: string
  matchPrefix: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard',    icon: LayoutDashboard, href: '/dashboard',      matchPrefix: '/dashboard' },
  { label: 'Produtos',     icon: Package,         href: '/produtos',       matchPrefix: '/produtos' },
  { label: 'Categorias',   icon: Tag,             href: '/categorias',     matchPrefix: '/categorias' },
  { label: 'Estoque',      icon: Archive,         href: '/estoque',        matchPrefix: '/estoque' },
  { label: 'Pedidos',      icon: ClipboardList,   href: '/pedidos',        matchPrefix: '/pedidos' },
  { label: 'Caixeiros',    icon: Users,           href: '/caixeiros',      matchPrefix: '/caixeiros' },
  { label: 'Relatórios',   icon: BarChart2,       href: '/relatorios',     matchPrefix: '/relatorios' },
  { label: 'Configurações',icon: Settings,        href: '/configuracoes',  matchPrefix: '/configuracoes' },
]

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, clearAuth } = useAuthStore()
  const primaryColor = useTenantStore((s) => s.primaryColor)
  const logoUrl = useTenantStore((s) => s.logoUrl)
  const newOrderCount = useNotificationStore((s) => s.newOrderCount)
  const clearNotifications = useNotificationStore((s) => s.clear)

  useOrderNotifications()

  useEffect(() => {
    document.documentElement.style.setProperty('--pdv-primary', primaryColor)
  }, [primaryColor])

  // Clear badge when user is on /pedidos
  useEffect(() => {
    if (pathname.startsWith('/pedidos') && newOrderCount > 0) {
      clearNotifications()
    }
  }, [pathname, newOrderCount, clearNotifications])

  const displayName = user?.name ?? 'Usuário'
  const initials    = getInitials(displayName)
  const roleLabel   = user?.role === 'store_owner' ? 'Dono da loja' : 'Caixeiro'

  function handleLogout() {
    clearAuth()
    router.replace('/login')
  }

  return (
    <aside
      className="hidden md:flex flex-col h-screen flex-shrink-0"
      style={{ width: '240px', backgroundColor: '#0F172A' }}
    >
      {/* Logo */}
      <div
        className="flex items-center"
        style={{ gap: '12px', padding: '0 20px 24px 20px' }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#1E3A5F' }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo da loja"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <ShoppingCart size={18} style={{ color: '#2563EB' }} />
          )}
        </div>
        <span
          className="font-bold"
          style={{ fontSize: '14px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}
        >
          PDV Universal
        </span>
      </div>

      <div style={{ height: '1px', backgroundColor: '#1E293B', width: '100%' }} />

      {/* Nav */}
      <nav className="flex flex-col flex-1" style={{ gap: '4px', padding: '16px 12px' }}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.matchPrefix)
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
                backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                textDecoration: 'none',
                borderLeft: isActive ? `3px solid ${primaryColor}` : '3px solid transparent',
              }}
            >
              <item.icon
                size={18}
                style={{ color: isActive ? primaryColor : '#94A3B8', flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontFamily: 'Inter, sans-serif',
                  flex: 1,
                }}
              >
                {item.label}
              </span>
              {item.matchPrefix === '/pedidos' && newOrderCount > 0 && (
                <span
                  style={{
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '9px',
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {newOrderCount > 9 ? '9+' : newOrderCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div style={{ height: '1px', backgroundColor: '#1E293B', width: '100%' }} />

      {/* Footer */}
      <div
        className="flex items-center"
        style={{ padding: '16px', gap: '10px' }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1E3A5F' }}
        >
          <span
            className="font-bold"
            style={{ fontSize: '12px', color: '#60A5FA', fontFamily: 'Inter, sans-serif' }}
          >
            {initials}
          </span>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="font-semibold truncate"
            style={{ fontSize: '13px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}
          >
            {displayName}
          </span>
          <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
            {roleLabel}
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
            color: '#64748B',
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
