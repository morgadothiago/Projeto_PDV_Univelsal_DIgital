'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Search, Store, Package } from 'lucide-react'
import { useMenuTenant, useMenuProducts, useMenuCategories } from '@/features/menu/hooks/useMenu'
import { useMenuCartStore } from '@/features/menu/store/cartStore'
import { ProductSheet } from './_components/ProductSheet'
import type { IProduct } from '@/features/products/interfaces/product.interface'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Deterministic emoji-color placeholder based on product name
function productEmoji(name: string): string {
  const emojis = ['🍔', '🍕', '🥗', '🍣', '🌮', '🍜', '🥩', '🍰', '🥤', '☕', '🍦', '🥪']
  const idx = name.charCodeAt(0) % emojis.length
  return emojis[idx]
}

function ProductSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-3 shadow-sm animate-pulse">
      <div className="mb-2 h-24 rounded-lg bg-slate-100" />
      <div className="h-4 w-3/4 rounded bg-slate-100 mb-1" />
      <div className="h-3 w-1/2 rounded bg-slate-100 mb-2" />
      <div className="mt-auto h-5 w-1/3 rounded bg-slate-100" />
    </div>
  )
}

export default function CardapioPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = use(params)

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)

  const { data: tenant, isError: tenantError } = useMenuTenant(tenantId)
  const { data: products = [], isLoading: loadingProducts } = useMenuProducts(tenantId)
  const { data: categories = [] } = useMenuCategories(tenantId)

  const { setTenantId, itemCount, total } = useMenuCartStore()

  useEffect(() => {
    setTenantId(tenantId)
  }, [tenantId, setTenantId])

  const primaryColor = tenant?.settings?.primaryColor ?? '#EA580C'
  const logoUrl = tenant?.settings?.logoUrl

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory ? p.categoryId === selectedCategory : true
    return matchSearch && matchCategory && p.isActive
  })

  const cartItemCount = itemCount()
  const cartTotal = total()

  if (tenantError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-sm">
          <Store size={48} className="mx-auto mb-4 text-slate-300" />
          <h1 className="text-lg font-semibold text-slate-700">Loja não encontrada</h1>
          <p className="mt-2 text-sm text-slate-400">
            Este cardápio não está disponível no momento. Verifique o QR Code e tente novamente.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{ '--pdv-primary': primaryColor } as React.CSSProperties}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-20 px-4 py-4 text-white shadow-md"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="mx-auto max-w-[500px]">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={tenant?.name ?? 'Logo'}
                className="h-9 w-9 rounded-full object-cover bg-white/20"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Store size={20} />
              </div>
            )}
            <h1 className="text-base font-bold truncate">
              {tenant?.name ?? 'Cardápio'}
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[500px] px-4 py-4 pb-28">
        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-[color:var(--pdv-primary)] transition-colors"
            aria-label="Buscar produto"
          />
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[36px]"
              style={
                !selectedCategory
                  ? { backgroundColor: primaryColor, color: '#fff' }
                  : { backgroundColor: '#fff', color: '#64748B', border: '1px solid #E2E8F0' }
              }
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[36px]"
                style={
                  selectedCategory === cat.id
                    ? { backgroundColor: primaryColor, color: '#fff' }
                    : { backgroundColor: '#fff', color: '#64748B', border: '1px solid #E2E8F0' }
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Product grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">Nenhum produto encontrado</p>
            {search && (
              <p className="text-sm text-slate-400 mt-1">
                Tente outro termo de busca
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                primaryColor={primaryColor}
                onOpen={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating cart button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center px-4">
          <Link
            href={`/cardapio/${tenantId}/carrinho`}
            className="flex w-full max-w-[500px] items-center justify-between rounded-2xl px-5 py-4 text-white shadow-xl active:scale-98 transition-transform"
            style={{ backgroundColor: primaryColor }}
            aria-label={`Ver carrinho — ${formatBRL(cartTotal)}`}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                {cartItemCount}
              </div>
              <span className="font-semibold">Ver carrinho</span>
            </div>
            <span className="font-bold">{formatBRL(cartTotal)}</span>
          </Link>
        </div>
      )}

      {/* Product detail sheet */}
      {selectedProduct && (
        <ProductSheet
          product={selectedProduct}
          primaryColor={primaryColor}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}

function ProductCard({
  product,
  primaryColor,
  onOpen,
}: {
  product: IProduct
  primaryColor: string
  onOpen: () => void
}) {
  const addItem = useMenuCartStore((s) => s.addItem)
  const items = useMenuCartStore((s) => s.items)
  const cartQty = items.find((i) => i.productId === product.id)?.quantity ?? 0

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation()
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    })
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col rounded-xl border border-slate-100 bg-white p-3 shadow-sm text-left w-full transition-shadow hover:shadow-md active:scale-[0.98]"
    >
      {/* Image / emoji placeholder */}
      <div className="mb-2 h-24 w-full rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden relative">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-4xl" aria-hidden>
            {productEmoji(product.name)}
          </span>
        )}
        {cartQty > 0 && (
          <div
            className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {cartQty}
          </div>
        )}
      </div>

      <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-tight">
        {product.name}
      </p>
      {product.categoryName && (
        <p className="mt-0.5 text-xs text-slate-400 truncate">{product.categoryName}</p>
      )}
      <div className="mt-auto flex items-center justify-between pt-2">
        <p className="text-sm font-bold" style={{ color: primaryColor }}>
          {formatBRL(product.price)}
        </p>
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white text-lg font-bold leading-none transition-opacity hover:opacity-80 active:scale-90 min-h-[44px] min-w-[44px]"
          style={{ backgroundColor: primaryColor }}
          aria-label={`Adicionar ${product.name}`}
        >
          +
        </button>
      </div>
    </button>
  )
}
