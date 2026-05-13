'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Archive,
  MoreHorizontal,
  Tag,
  Users,
  BarChart2,
  LogOut,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'

const primaryItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'PDV',       icon: ShoppingCart,    href: '/pdv' },
  { label: 'Produtos',  icon: Package,         href: '/produtos' },
  { label: 'Estoque',   icon: Archive,         href: '/estoque' },
]

const moreItems = [
  { label: 'Categorias', icon: Tag,      href: '/categorias' },
  { label: 'Caixeiros',  icon: Users,    href: '/caixeiros' },
  { label: 'Relatórios', icon: BarChart2, href: '/relatorios' },
]

export function MobileBottomNav() {
  const pathname  = usePathname()
  const router    = useRouter()
  const { clearAuth } = useAuthStore()
  const [open, setOpen] = useState(false)

  function handleLogout() {
    setOpen(false)
    clearAuth()
    router.replace('/login')
  }

  const isMoreActive = moreItems.some((i) => pathname.startsWith(i.href))

  return (
    <>
      {/* Bottom tab bar — mobile only */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around"
        style={{
          height: '64px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
        }}
      >
        {primaryItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full no-underline"
              style={{ gap: '4px', textDecoration: 'none' }}
            >
              <item.icon size={22} style={{ color: isActive ? '#2563EB' : '#94A3B8' }} />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#2563EB' : '#94A3B8',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* More button */}
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full"
          style={{ gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label="Mais opções"
        >
          <MoreHorizontal size={22} style={{ color: isMoreActive ? '#2563EB' : '#94A3B8' }} />
          <span
            style={{
              fontSize: '10px',
              fontWeight: isMoreActive ? 600 : 400,
              color: isMoreActive ? '#2563EB' : '#94A3B8',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Mais
          </span>
        </button>
      </nav>

      {/* Drawer overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end"
          style={{ backgroundColor: '#0F172A66' }}
          onClick={() => setOpen(false)}
        >
          {/* Sheet */}
          <div
            className="flex flex-col"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px 24px 0 0',
              padding: '12px 0 32px 0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center" style={{ paddingBottom: '16px' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: '#E2E8F0' }} />
            </div>

            {/* Close row */}
            <div className="flex items-center justify-between" style={{ padding: '0 20px 12px 20px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>
                Menu
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                aria-label="Fechar"
              >
                <X size={20} style={{ color: '#64748B' }} />
              </button>
            </div>

            {/* More nav items */}
            {moreItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center no-underline"
                  style={{
                    gap: '14px',
                    padding: '14px 20px',
                    textDecoration: 'none',
                    backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                  }}
                >
                  <item.icon size={20} style={{ color: isActive ? '#2563EB' : '#64748B', flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#2563EB' : '#0F172A',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '8px 0' }} />

            {/* Sair */}
            <button
              onClick={handleLogout}
              className="flex items-center"
              style={{
                gap: '14px',
                padding: '14px 20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <LogOut size={20} style={{ color: '#DC2626', flexShrink: 0 }} />
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 400,
                  color: '#DC2626',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Sair
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
