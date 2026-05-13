interface PlanBadgeProps {
  plan: string
}

export function PlanBadge({ plan }: PlanBadgeProps) {
  if (plan === 'pro') {
    return (
      <span
        style={{
          backgroundColor: '#FDF4FF',
          color: '#7C3AED',
          fontSize: '11px',
          fontWeight: 700,
          borderRadius: '11px',
          height: '22px',
          padding: '0 10px',
          display: 'inline-flex',
          alignItems: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Pro
      </span>
    )
  }

  return (
    <span
      style={{
        backgroundColor: '#F1F5F9',
        color: '#64748B',
        fontSize: '11px',
        fontWeight: 600,
        borderRadius: '11px',
        height: '22px',
        padding: '0 10px',
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      Gratuito
    </span>
  )
}
