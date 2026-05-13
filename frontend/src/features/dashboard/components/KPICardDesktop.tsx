import { TrendingUp, type LucideIcon } from 'lucide-react'

interface KPICardDesktopProps {
  icon: LucideIcon
  iconColor: string
  iconBg: string
  value: string
  label: string
  delta?: string
  deltaPositive?: boolean
}

export function KPICardDesktop({
  icon: Icon,
  iconColor,
  iconBg,
  value,
  label,
  delta,
  deltaPositive,
}: KPICardDesktopProps) {
  return (
    <div
      className="flex flex-col bg-white rounded-[12px] border shadow-sm"
      style={{ borderColor: '#E2E8F0', padding: '20px', gap: '8px' }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontSize: '13px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
          {label}
        </span>
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
      </div>

      <span
        className="font-bold leading-tight"
        style={{
          fontSize: value.length > 8 ? '28px' : '32px',
          color: '#0F172A',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {value}
      </span>

      {delta !== undefined ? (
        <div className="flex items-center gap-1">
          <TrendingUp size={14} style={{ color: '#16A34A' }} />
          <span
            className="font-bold"
            style={{ fontSize: '12px', color: '#16A34A', fontFamily: 'Inter, sans-serif' }}
          >
            {delta}
          </span>
        </div>
      ) : (
        <span style={{ fontSize: '12px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
          &nbsp;
        </span>
      )}
    </div>
  )
}
