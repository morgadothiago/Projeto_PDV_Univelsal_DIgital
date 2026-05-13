interface StatusBadgeProps {
  status: 'active' | 'suspended' | 'pending' | string
}

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: '#DCFCE7', color: '#16A34A', label: 'Ativo' },
  suspended: { bg: '#FEF2F2', color: '#DC2626', label: 'Suspenso' },
  pending: { bg: '#FEF9C3', color: '#854D0E', label: 'Pendente' },
  confirmed: { bg: '#DCFCE7', color: '#16A34A', label: 'Confirmado' },
  completed: { bg: '#DBEAFE', color: '#1D4ED8', label: 'Concluído' },
  cancelled: { bg: '#FEF2F2', color: '#DC2626', label: 'Cancelado' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig['active']

  return (
    <span
      style={{
        backgroundColor: config.bg,
        color: config.color,
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
      {config.label}
    </span>
  )
}
