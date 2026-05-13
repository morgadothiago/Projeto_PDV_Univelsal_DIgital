'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Coffee,
  Sandwich,
  Cookie,
  CupSoda,
  Cake,
} from 'lucide-react'
import { useProducts } from '@/features/products/hooks/useProducts'
import { useDebounce } from '@/hooks/useDebounce'
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar'
import type { IProduct } from '@/features/products/interfaces/product.interface'
import type { LucideIcon } from 'lucide-react'

const PRODUCT_ICONS: { icon: LucideIcon; color: string; bg: string }[] = [
  { icon: Coffee,   color: '#2563EB', bg: '#EFF6FF' },
  { icon: Sandwich, color: '#16A34A', bg: '#F0FDF4' },
  { icon: Cookie,   color: '#EA580C', bg: '#FFF7ED' },
  { icon: CupSoda,  color: '#9333EA', bg: '#FDF4FF' },
  { icon: Cake,     color: '#E11D48', bg: '#FFF1F2' },
]

function getProductIcon(index: number) {
  return PRODUCT_ICONS[index % PRODUCT_ICONS.length]
}

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function ProductCard({ product, index }: { product: IProduct; index: number }) {
  const router = useRouter()
  const iconConfig = getProductIcon(index)
  const Icon = iconConfig.icon
  const isLow = product.stock <= 15

  return (
    <button
      onClick={() => router.push(`/produtos/${product.id}`)}
      className="flex flex-row items-center bg-white rounded-[10px] border text-left w-full"
      style={{ borderColor: '#E2E8F0', padding: '12px 14px', gap: '12px' }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '8px',
          backgroundColor: iconConfig.bg,
        }}
      >
        <Icon size={20} style={{ color: iconConfig.color }} />
      </div>

      <div className="flex flex-col flex-1 min-w-0" style={{ gap: '3px' }}>
        <span
          className="font-semibold truncate"
          style={{ fontSize: '14px', color: '#0F172A' }}
        >
          {product.name}
        </span>
        <span
          className="truncate"
          style={{ fontSize: '12px', color: '#64748B' }}
        >
          {product.categoryName ?? 'Sem categoria'}
        </span>
      </div>

      <div className="flex flex-col items-end flex-shrink-0" style={{ gap: '4px' }}>
        <span className="font-bold" style={{ fontSize: '14px', color: '#0F172A' }}>
          {formatPrice(product.price)}
        </span>
        <span
          className="font-semibold"
          style={{
            fontSize: '11px',
            height: '20px',
            padding: '0 8px',
            borderRadius: '10px',
            lineHeight: '20px',
            backgroundColor: isLow ? '#FEE2E2' : '#DCFCE7',
            color: isLow ? '#DC2626' : '#16A34A',
          }}
        >
          {isLow ? 'Estoque baixo' : 'Em estoque'}
        </span>
      </div>
    </button>
  )
}

export default function ProdutosPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const { data, isLoading } = useProducts({ search: debouncedSearch || undefined })
  const products = data?.items ?? []

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      <DashboardSidebar />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between bg-white flex-shrink-0"
          style={{ height: '62px', padding: '0 16px', borderBottom: '1px solid #E2E8F0' }}
        >
          <span className="font-bold" style={{ fontSize: '18px', color: '#0F172A' }}>
            Produtos
          </span>
          <Link
            href="/produtos/new"
            className="flex items-center no-underline"
            style={{
              height: '36px',
              padding: '0 14px',
              borderRadius: '8px',
              backgroundColor: '#2563EB',
              gap: '6px',
              textDecoration: 'none',
            }}
          >
            <Plus size={16} style={{ color: '#FFFFFF' }} />
            <span className="font-semibold" style={{ fontSize: '13px', color: '#FFFFFF' }}>
              Novo
            </span>
          </Link>
        </header>

        {/* Search */}
        <div
          className="flex items-center flex-shrink-0 bg-white"
          style={{ padding: '0 16px', paddingTop: '12px', paddingBottom: '12px' }}
        >
          <div
            className="flex items-center flex-1 border"
            style={{
              height: '44px',
              padding: '0 14px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              borderColor: '#E2E8F0',
              gap: '10px',
            }}
          >
            <Search size={16} style={{ color: '#64748B', flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto..."
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: '13px', color: '#0F172A' }}
            />
          </div>
        </div>

        {/* List */}
        <div
          className="flex flex-col overflow-y-auto flex-1"
          style={{ gap: '8px', padding: '0 16px 12px' }}
        >
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-[10px]"
                style={{ height: '68px', backgroundColor: '#E2E8F0' }}
              />
            ))
          ) : products.length === 0 ? (
            <div
              className="flex items-center justify-center"
              style={{ paddingTop: '40px' }}
            >
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>
                Nenhum produto encontrado
              </span>
            </div>
          ) : (
            products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
