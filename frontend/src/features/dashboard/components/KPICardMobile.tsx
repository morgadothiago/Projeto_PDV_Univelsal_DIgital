import { TrendingUp, type LucideIcon } from 'lucide-react'

interface KPICardMobileProps {
  icon: LucideIcon
  iconColor: string
  iconBg: string
  value: string
  label: string
  delta?: string
  deltaPositive?: boolean
}

export function KPICardMobile({
  icon: Icon,
  iconColor,
  iconBg,
  value,
  label,
  delta,
  deltaPositive,
}: KPICardMobileProps) {
  return (
    <div
      className="flex flex-col bg-white rounded-[12px] border shadow-sm"
      style={{ borderColor: '#E2E8F0', padding: '14px', gap: '6px' }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: iconBg,
        }}
      >
        <Icon size={18} style={{ color: iconColor }} />
      </div>

      <span
        className="font-bold leading-tight"
        style={{ fontSize: '22px', color: '#0F172A', fontFamily: 'Inter, sans-serif' }}
      >
        {value}
      </span>

      <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
        {label}
      </span>

      {delta !== undefined && (
        <div className="flex items-center gap-1">
          <TrendingUp size={12} style={{ color: '#16A34A' }} />
          <span
            className="font-bold"
            style={{ fontSize: '11px', color: '#16A34A', fontFamily: 'Inter, sans-serif' }}
          >
            {delta}
          </span>
        </div>
      )}
    </div>
  )
}
