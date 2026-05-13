'use client'

import { useRouter } from 'next/navigation'
import { PackageSearch } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-6"
      style={{ backgroundColor: '#F8FAFC' }}
    >
      <PackageSearch size={64} style={{ color: '#CBD5E1' }} aria-hidden />
      <div className="flex flex-col items-center gap-2 text-center">
        <h1
          className="font-bold"
          style={{ fontSize: '24px', color: '#0F172A' }}
        >
          404 — Página não encontrada
        </h1>
        <p style={{ fontSize: '14px', color: '#64748B' }}>
          A página que você está procurando não existe ou foi removida.
        </p>
      </div>
      <button
        onClick={() => router.push('/')}
        className="font-semibold"
        style={{
          height: '44px',
          padding: '0 24px',
          borderRadius: '10px',
          backgroundColor: '#2563EB',
          color: '#FFFFFF',
          fontSize: '14px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Voltar ao início
      </button>
    </main>
  )
}
