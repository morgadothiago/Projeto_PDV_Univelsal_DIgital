'use client'

import { useState } from 'react'
import { PackagePlus, TriangleAlert, X, ChevronDown } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useProducts } from '@/features/products/hooks/useProducts'
import { stockApi } from '@/features/stock/api/stock.api'
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar'
import { usePlanUsage } from '@/features/billing/hooks/usePlanUsage'
import { UpgradeWall } from '@/features/billing/components/UpgradeWall'
import type { IProduct } from '@/features/products/interfaces/product.interface'

type StockLevel = 'ok' | 'low' | 'critical'

function getStockLevel(stock: number): StockLevel {
  if (stock <= 5) return 'critical'
  if (stock <= 15) return 'low'
  return 'ok'
}

function getStockStyle(level: StockLevel) {
  switch (level) {
    case 'critical':
      return {
        cardBg: '#FEE2E2',
        cardBorder: '#FECACA',
        valueColor: '#DC2626',
        badgeBg: '#FEE2E2',
        badgeColor: '#DC2626',
        label: 'Crítico',
      }
    case 'low':
      return {
        cardBg: '#FEF3C7',
        cardBorder: '#FDE68A',
        valueColor: '#D97706',
        badgeBg: '#FDE68A',
        badgeColor: '#D97706',
        label: 'Baixo',
      }
    default:
      return {
        cardBg: '#FFFFFF',
        cardBorder: '#E2E8F0',
        valueColor: '#16A34A',
        badgeBg: '#DCFCE7',
        badgeColor: '#16A34A',
        label: 'Ok',
      }
  }
}

interface StockItemCardProps {
  product: IProduct
}

function StockItemCard({ product }: StockItemCardProps) {
  const level = getStockLevel(product.stock)
  const style = getStockStyle(level)

  return (
    <div
      className="flex items-center border rounded-[10px]"
      style={{
        padding: '12px 14px',
        backgroundColor: style.cardBg,
        borderColor: style.cardBorder,
        gap: '12px',
      }}
    >
      <div className="flex flex-col flex-1 min-w-0" style={{ gap: '2px' }}>
        <span className="font-semibold truncate" style={{ fontSize: '14px', color: '#0F172A' }}>
          {product.name}
        </span>
        <span style={{ fontSize: '12px', color: '#64748B' }}>
          {product.categoryName ?? 'Sem categoria'}
        </span>
      </div>
      <div className="flex flex-col items-end flex-shrink-0" style={{ gap: '4px' }}>
        <span className="font-bold" style={{ fontSize: '14px', color: style.valueColor }}>
          {product.stock} {product.customUnit || (product.unitType === 'weight' ? 'kg' : 'un')}
        </span>
        <span
          className="font-semibold"
          style={{
            fontSize: '11px',
            height: '20px',
            padding: '0 8px',
            borderRadius: '10px',
            lineHeight: '20px',
            backgroundColor: style.badgeBg,
            color: style.badgeColor,
          }}
        >
          {style.label}
        </span>
      </div>
    </div>
  )
}

interface EntradaSheetProps {
  products: IProduct[]
  onClose: () => void
}

function EntradaSheet({ products, onClose }: EntradaSheetProps) {
  const queryClient = useQueryClient()
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: () => stockApi.addEntry({ productId, quantity: Number(quantity) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Entrada registrada com sucesso')
      onClose()
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Erro ao registrar entrada'
      toast.error(msg)
    },
  })

  function handleSubmit() {
    if (!productId || !quantity || Number(quantity) <= 0) return
    mutate()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex flex-col bg-white"
        style={{ borderRadius: '16px 16px 0 0', padding: '20px 16px 40px', gap: '16px' }}
      >
        {/* Handle + header */}
        <div className="flex items-center justify-between">
          <span className="font-bold" style={{ fontSize: '17px', color: '#0F172A' }}>
            Entrada de Estoque
          </span>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
          >
            <X size={20} style={{ color: '#64748B' }} />
          </button>
        </div>

        {/* Product select */}
        <div className="flex flex-col" style={{ gap: '6px' }}>
          <label className="font-medium" style={{ fontSize: '13px', color: '#0F172A' }}>
            Produto
          </label>
          <div className="relative">
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="border appearance-none w-full outline-none"
              style={{
                height: '48px',
                padding: '0 40px 0 14px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                borderColor: '#E2E8F0',
                fontSize: '14px',
                color: '#0F172A',
                boxSizing: 'border-box',
              }}
            >
              <option value="">Selecionar produto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              style={{ color: '#64748B', position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* Quantity */}
        <div className="flex flex-col" style={{ gap: '6px' }}>
          <label className="font-medium" style={{ fontSize: '13px', color: '#0F172A' }}>
            Quantidade
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className="border outline-none"
            style={{
              height: '48px',
              padding: '0 14px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              borderColor: '#E2E8F0',
              fontSize: '14px',
              color: '#0F172A',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isPending || !productId || !quantity}
          className="font-bold"
          style={{
            height: '52px',
            borderRadius: '12px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            fontSize: '15px',
            border: 'none',
            cursor: isPending || !productId || !quantity ? 'not-allowed' : 'pointer',
            opacity: isPending || !productId || !quantity ? 0.7 : 1,
          }}
        >
          {isPending ? 'Registrando...' : 'Registrar Entrada'}
        </button>
      </div>
    </div>
  )
}

export default function EstoquePage() {
  const { data: usage } = usePlanUsage()
  const [sheetOpen, setSheetOpen] = useState(false)
  const { data, isLoading } = useProducts()
  const products = data?.items ?? []

  const lowStockCount = products.filter((p) => p.stock <= 15).length

  const sorted = [...products].sort((a, b) => a.stock - b.stock)

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      <DashboardSidebar />

      {usage && usage.plan === 'free' ? (
        <UpgradeWall
          feature="Gestão de Estoque"
          description="Adicione entradas de estoque, veja alertas de estoque baixo e controle seu inventário no plano Pro."
        />
      ) : (
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between bg-white flex-shrink-0"
          style={{ height: '62px', padding: '0 16px', borderBottom: '1px solid #E2E8F0' }}
        >
          <span className="font-bold" style={{ fontSize: '18px', color: '#0F172A' }}>
            Estoque
          </span>
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center"
            style={{
              height: '36px',
              padding: '0 14px',
              borderRadius: '8px',
              backgroundColor: '#2563EB',
              border: 'none',
              cursor: 'pointer',
              gap: '6px',
            }}
          >
            <PackagePlus size={16} style={{ color: '#FFFFFF' }} />
            <span className="font-semibold" style={{ fontSize: '13px', color: '#FFFFFF' }}>
              Entrada
            </span>
          </button>
        </header>

        {/* Content */}
        <div
          className="flex flex-col overflow-y-auto flex-1 pb-16 md:pb-0"
          style={{ gap: '10px', padding: '12px 16px' }}
        >
          {/* Alert */}
          {lowStockCount > 0 && (
            <div
              className="flex items-center border rounded-[10px]"
              style={{
                padding: '12px 14px',
                backgroundColor: '#FEF3C7',
                borderColor: '#FDE68A',
                gap: '10px',
              }}
            >
              <TriangleAlert size={18} style={{ color: '#D97706', flexShrink: 0 }} />
              <span className="font-semibold" style={{ fontSize: '13px', color: '#92400E' }}>
                {lowStockCount} {lowStockCount === 1 ? 'produto' : 'produtos'} com estoque baixo
              </span>
            </div>
          )}

          {/* Stock items */}
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-[10px]"
                style={{ height: '64px', backgroundColor: '#E2E8F0' }}
              />
            ))
          ) : sorted.length === 0 ? (
            <div className="flex items-center justify-center" style={{ paddingTop: '40px' }}>
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>
                Nenhum produto cadastrado
              </span>
            </div>
          ) : (
            sorted.map((product) => (
              <StockItemCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>

      )}

      {sheetOpen && (
        <EntradaSheet products={products} onClose={() => setSheetOpen(false)} />
      )}
    </div>
  )
}
