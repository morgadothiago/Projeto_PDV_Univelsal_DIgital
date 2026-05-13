import type { ReactNode } from 'react'

interface AdminTopBarProps {
  left: ReactNode
  right?: ReactNode
}

export function AdminTopBar({ left, right }: AdminTopBarProps) {
  return (
    <header
      className="flex items-center justify-between flex-shrink-0"
      style={{
        backgroundColor: '#FFFFFF',
        height: '64px',
        padding: '0 32px',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      <div className="flex items-center" style={{ gap: '8px' }}>
        {left}
      </div>
      {right && (
        <div className="flex items-center" style={{ gap: '12px' }}>
          {right}
        </div>
      )}
    </header>
  )
}
