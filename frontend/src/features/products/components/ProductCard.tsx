'use client'

import { ShoppingBasket } from 'lucide-react'
import type { IProduct } from '../interfaces/product.interface'

const BG_COLORS = [
  { bg: '#EFF6FF', icon: '#2563EB' },
  { bg: '#F0FDF4', icon: '#16A34A' },
  { bg: '#FFF7ED', icon: '#EA580C' },
  { bg: '#FDF4FF', icon: '#9333EA' },
  { bg: '#FFF1F2', icon: '#E11D48' },
]

function getColorIndex(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % BG_COLORS.length
}

interface ProductCardProps {
  product: IProduct
  onAdd: (product: IProduct) => void
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const colorPair = BG_COLORS[getColorIndex(product.id)]
  const unitLabel = product.customUnit || (product.unitType === 'weight' ? 'kg' : 'un')

  return (
    <button
      onClick={() => onAdd(product)}
      aria-label={`Adicionar ${product.name} ao carrinho`}
      className="flex flex-col gap-2 rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-sm transition-transform hover:scale-[1.02] hover:shadow-md text-left w-full"
    >
      {/* Image box */}
      <div
        className="flex w-full items-center justify-center rounded-lg md:h-[120px] h-20"
        style={{ backgroundColor: colorPair.bg }}
        aria-hidden
      >
        <ShoppingBasket size={28} style={{ color: colorPair.icon }} />
      </div>

      {/* Name */}
      <span className="text-xs font-semibold text-[#0F172A] leading-tight line-clamp-2">
        {product.name}
      </span>

      {/* Price + unit */}
      <div className="flex items-baseline gap-1">
        <span className="text-[13px] font-bold text-[#2563EB]">
          {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
        <span className="text-[11px] text-[#94A3B8]">
          por {unitLabel}
        </span>
      </div>
    </button>
  )
}
