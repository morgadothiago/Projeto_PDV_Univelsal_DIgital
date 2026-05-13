'use client'

import { useState } from 'react'
import { Search, Signal, Wifi, Battery } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useDebounce } from '@/hooks/useDebounce'
import { useProducts } from '@/features/products/hooks/useProducts'
import { useCategories } from '@/features/products/hooks/useCategories'
import { useCartStore } from '@/features/orders/store/cart.store'
import { CategoryPills } from '@/features/products/components/CategoryPills'
import { ProductGrid } from '@/features/products/components/ProductGrid'
import { CartFAB } from '@/features/orders/components/CartFAB'
import { CartPanel } from '@/features/orders/components/CartPanel'
import { Sidebar } from '@/components/shared/Sidebar'
import type { IProduct } from '@/features/products/interfaces/product.interface'

const TODAY = new Date().toLocaleDateString('pt-BR')

export default function PdvPage() {
  const { user } = useAuthStore()
  const addItem = useCartStore((s) => s.addItem)

  const [search, setSearch] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const { data: productList, isLoading: productsLoading } = useProducts({
    search: debouncedSearch || undefined,
    categoryId: activeCategoryId ?? undefined,
  })

  const { data: categories = [] } = useCategories()

  const products: IProduct[] = productList?.items ?? []

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'CA'

  const cashierName = user?.name ?? 'Carlos A.'

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* ── Desktop sidebar ────────────────────────────── */}
      <Sidebar />

      {/* ── Main area ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* ── Mobile: Status bar ─────────────────────── */}
        <div className="flex md:hidden h-[62px] flex-shrink-0 items-center justify-between bg-[#2563EB] px-5">
          <span className="text-[15px] font-semibold text-white">9:41</span>
          <div className="flex items-center gap-1">
            <Signal size={16} className="text-white" aria-hidden />
            <Wifi size={16} className="text-white" aria-hidden />
            <Battery size={16} className="text-white" aria-hidden />
          </div>
        </div>

        {/* ── Mobile: PDV Header ─────────────────────── */}
        <div className="flex md:hidden flex-shrink-0 flex-col gap-3 bg-[#2563EB] px-5 pt-4 pb-5">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-white">PDV — Venda</h1>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D4ED8]">
              <span className="text-xs font-bold text-white">{initials}</span>
            </div>
          </div>
          {/* Mobile search */}
          <div className="flex h-11 items-center gap-2.5 rounded-[10px] border border-white/25 bg-white/15 px-3.5">
            <Search size={18} className="text-white/80 flex-shrink-0" aria-hidden />
            <input
              type="search"
              placeholder="Buscar produto..."
              aria-label="Buscar produto"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/65 outline-none"
            />
          </div>
        </div>

        {/* ── Desktop: Top bar ───────────────────────── */}
        <div className="hidden md:flex h-16 flex-shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-[#0F172A]">PDV — Nova Venda</h1>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Buscar produto ou código..."
                aria-label="Buscar produto"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-[360px] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-[#64748B]">{TODAY}</span>
            <span className="text-[13px] font-medium text-[#0F172A]">Caixa: {cashierName}</span>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────── */}
        <div className="flex flex-1 min-h-0">

          {/* Product area */}
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-[#F8FAFC] p-4 md:p-5 pb-16 md:pb-5">
            <CategoryPills
              categories={categories}
              activeId={activeCategoryId}
              onSelect={setActiveCategoryId}
            />
            <ProductGrid
              products={products}
              isLoading={productsLoading}
              onAddProduct={addItem}
            />
          </div>

          {/* Desktop cart panel */}
          <CartPanel />
        </div>

        {/* Mobile cart FAB */}
        <CartFAB />
      </div>
    </div>
  )
}
