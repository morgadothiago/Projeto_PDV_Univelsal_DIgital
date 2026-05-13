'use client'

import { Loader2 } from 'lucide-react'
import type { IProduct } from '../interfaces/product.interface'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: IProduct[]
  isLoading: boolean
  onAddProduct: (product: IProduct) => void
}

export function ProductGrid({ products, isLoading, onAddProduct }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="animate-spin text-[#2563EB]" aria-label="Carregando produtos" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#64748B]">
        <p className="text-sm">Nenhum produto encontrado.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={onAddProduct} />
      ))}
    </div>
  )
}
