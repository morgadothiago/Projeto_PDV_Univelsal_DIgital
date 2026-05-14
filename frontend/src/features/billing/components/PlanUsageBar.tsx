'use client'

interface PlanUsageBarProps {
  label: string
  current: number
  limit: number | null
}

export function PlanUsageBar({ label, current, limit }: PlanUsageBarProps) {
  if (limit === null) return null

  const pct = Math.min((current / limit) * 100, 100)
  const atLimit = current >= limit
  const nearLimit = pct >= 80

  const barColor = atLimit ? '#DC2626' : nearLimit ? '#D97706' : '#2563EB'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 12, color: '#64748B' }}>{label}</span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: atLimit ? '#DC2626' : nearLimit ? '#D97706' : '#0F172A',
          }}
        >
          {current}/{limit}
          {atLimit && ' — limite atingido'}
        </span>
      </div>
      <div
        className="rounded-full overflow-hidden"
        style={{ height: 6, backgroundColor: '#E2E8F0' }}
      >
        <div
          className="rounded-full transition-all"
          style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}
