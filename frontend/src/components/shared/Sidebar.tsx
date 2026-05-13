'use client'

import { ScanBarcode, History, Settings, ShoppingCart } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'

const NAV_ITEMS = [
  { icon: ScanBarcode, label: 'PDV', active: true },
  { icon: History, label: 'Histórico', active: false },
  { icon: Settings, label: 'Configurações', active: false },
]

export function Sidebar() {
  const { user } = useAuthStore()
  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'CA'

  return (
    <aside className="hidden md:flex w-[72px] flex-shrink-0 flex-col items-center gap-2 py-5 bg-[#0F172A]">
      {/* Logo */}
      <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#2563EB]">
        <ShoppingCart size={22} className="text-white" aria-hidden />
      </div>

      {/* Spacer */}
      <div className="h-11" />

      {/* Nav items */}
      {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
        <button
          key={label}
          aria-label={label}
          className={`flex h-12 w-12 items-center justify-center rounded-[10px] transition-colors ${
            active ? 'bg-[#2563EB]' : 'hover:bg-white/10'
          }`}
        >
          <Icon
            size={22}
            className={active ? 'text-white' : 'text-[#94A3B8]'}
            aria-hidden
          />
        </button>
      ))}

      {/* Spacer fill */}
      <div className="flex-1" />

      {/* Avatar */}
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E3A5F]"
        aria-label={`Usuário: ${user?.name ?? 'Carlos A.'}`}
      >
        <span className="text-xs font-bold text-[#60A5FA]">{initials}</span>
      </div>
    </aside>
  )
}
