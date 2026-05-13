'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, Search } from 'lucide-react'
import { menuApi } from '@/features/menu/api/menu.api'

export default function CardapioPage() {
  const { tenantId } = useParams<{ tenantId: string }>()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const {
    data: products = [],
    isLoading: loadingProducts,
    isError,
  } = useQuery({
    queryKey: ['menu-products', tenantId],
    queryFn: () => menuApi.getProducts(tenantId),
    retry: 1,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['menu-categories', tenantId],
    queryFn: () => menuApi.getCategories(tenantId),
    retry: 1,
  })

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory ? p.categoryId === selectedCategory : true
    return matchSearch && matchCategory && p.active
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#2563EB] px-4 py-4 text-white shadow">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} />
            <h1 className="text-lg font-bold">Cardapio</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white pl-9 pr-4 text-sm outline-none focus:border-[#2563EB]"
          />
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white text-[#64748B] border border-[#E2E8F0]'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white text-[#64748B] border border-[#E2E8F0]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="py-12 text-center">
            <p className="text-[#64748B] font-medium">Cardapio indisponivel</p>
            <p className="text-sm text-[#94A3B8] mt-1">
              Nao foi possivel carregar o menu. Tente novamente mais tarde.
            </p>
          </div>
        )}

        {/* Product grid */}
        {!isError &&
          (loadingProducts ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-xl bg-[#E2E8F0]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-[#94A3B8]">Nenhum produto encontrado</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filtered.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-sm"
                >
                  <div className="mb-2 h-24 rounded-lg bg-[#F1F5F9] flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ShoppingCart size={28} className="text-[#CBD5E1]" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#0F172A] line-clamp-2">
                    {product.name}
                  </p>
                  {product.categoryName && (
                    <p className="mt-0.5 text-xs text-[#94A3B8]">{product.categoryName}</p>
                  )}
                  <p className="mt-auto pt-2 text-base font-bold text-[#2563EB]">
                    {product.price.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  )
}
