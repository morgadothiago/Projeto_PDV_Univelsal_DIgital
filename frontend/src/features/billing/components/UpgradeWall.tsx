'use client'

import Link from 'next/link'
import { Lock, Zap } from 'lucide-react'

interface UpgradeWallProps {
  feature: string
  description?: string
}

export function UpgradeWall({ feature, description }: UpgradeWallProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-10">
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: 64, height: 64, backgroundColor: '#F1F5F9' }}
      >
        <Lock size={28} style={{ color: '#94A3B8' }} />
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <span className="font-bold" style={{ fontSize: 18, color: '#0F172A' }}>
          {feature} — Plano Pro
        </span>
        <span style={{ fontSize: 14, color: '#64748B', maxWidth: 360 }}>
          {description ?? 'Esta funcionalidade está disponível apenas no plano Pro. Faça upgrade para desbloquear.'}
        </span>
      </div>

      <Link
        href="/configuracoes"
        className="flex items-center gap-2 font-semibold rounded-lg"
        style={{
          backgroundColor: '#2563EB',
          color: '#FFFFFF',
          padding: '10px 24px',
          fontSize: 14,
          borderRadius: 8,
        }}
      >
        <Zap size={16} />
        Fazer upgrade para Pro — R$79/mês
      </Link>
    </div>
  )
}
