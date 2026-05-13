import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Tag,
  Archive,
  Users,
  BarChart2,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'

interface NavItem {
  label: string
  icon: LucideIcon
  active: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Produtos', icon: Package, active: false },
  { label: 'Categorias', icon: Tag, active: false },
  { label: 'Estoque', icon: Archive, active: false },
  { label: 'Caixeiros', icon: Users, active: false },
  { label: 'Relatórios', icon: BarChart2, active: false },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function DashboardSidebar() {
  const { user } = useAuthStore()
  const displayName = user?.name ?? 'Usuário'
  const initials = getInitials(displayName)

  return (
    <aside
      className="hidden md:flex flex-col h-screen flex-shrink-0"
      style={{ width: '240px', backgroundColor: '#0F172A' }}
    >
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
            backgroundColor: '#1E3A5F',
          }}
        >
          <ShoppingCart size={18} style={{ color: '#2563EB' }} />
        </div>
        <span
          className="font-bold"
          style={{ fontSize: '14px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}
        >
          PDV Universal
        </span>
      </div>

      <div style={{ height: '1px', backgroundColor: '#1E293B', width: '100%' }} />

      <nav
        className="flex flex-col flex-1"
        style={{ gap: '4px', padding: '16px 12px' }}
      >
        {navItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center cursor-pointer"
            style={{
              gap: '10px',
              height: '40px',
              padding: '0 12px',
              borderRadius: '8px',
              backgroundColor: item.active ? '#1E3A5F' : 'transparent',
            }}
          >
            <item.icon
              size={16}
              style={{ color: item.active ? '#60A5FA' : '#94A3B8', flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: '14px',
                fontWeight: item.active ? 600 : 400,
                color: item.active ? '#FFFFFF' : '#94A3B8',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </nav>

      <div style={{ height: '1px', backgroundColor: '#1E293B', width: '100%' }} />

      <div
        className="flex items-center"
        style={{ padding: '16px 16px', gap: '10px' }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#1E3A5F',
          }}
        >
          <span
            className="font-bold"
            style={{ fontSize: '12px', color: '#60A5FA', fontFamily: 'Inter, sans-serif' }}
          >
            {initials}
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="font-semibold truncate"
            style={{ fontSize: '13px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}
          >
            {displayName}
          </span>
          <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
            Dono da loja
          </span>
        </div>
      </div>
    </aside>
  )
}
