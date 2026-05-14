'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useMenuCartStore } from '@/features/menu/store/cartStore'
import { useMenuTenant } from '@/features/menu/hooks/useMenu'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function CarrinhoPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = use(params)
  const router = useRouter()

  const { data: tenant } = useMenuTenant(tenantId)
  const primaryColor = tenant?.settings?.primaryColor ?? '#EA580C'

  const items = useMenuCartStore((s) => s.items)
  const orderNotes = useMenuCartStore((s) => s.orderNotes)
  const updateQty = useMenuCartStore((s) => s.updateQty)
  const removeItem = useMenuCartStore((s) => s.removeItem)
  const setOrderNotes = useMenuCartStore((s) => s.setOrderNotes)
  const total = useMenuCartStore((s) => s.total)

  const subtotal = total()

  if (items.length === 0) {
    return (
      <div
        className="flex min-h-screen flex-col bg-slate-50"
        style={{ '--pdv-primary': primaryColor } as React.CSSProperties}
      >
        <header
          className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4 text-white shadow"
          style={{ backgroundColor: primaryColor }}
        >
          <Link
            href={`/cardapio/${tenantId}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 min-h-[44px] min-w-[44px]"
            aria-label="Voltar ao cardápio"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-base font-bold">Meu Carrinho</h1>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <ShoppingBag size={48} className="mb-4 text-slate-300" />
          <p className="font-semibold text-slate-600">Carrinho vazio</p>
          <p className="mt-1 text-sm text-slate-400">Adicione produtos para continuar</p>
          <Link
            href={`/cardapio/${tenantId}`}
            className="mt-6 rounded-2xl px-8 py-3 text-sm font-semibold text-white min-h-[44px]"
            style={{ backgroundColor: primaryColor }}
          >
            Ver cardápio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-slate-50"
      style={{ '--pdv-primary': primaryColor } as React.CSSProperties}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4 text-white shadow"
        style={{ backgroundColor: primaryColor }}
      >
        <Link
          href={`/cardapio/${tenantId}`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 min-h-[44px] min-w-[44px]"
          aria-label="Voltar ao cardápio"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-base font-bold">Meu Carrinho</h1>
        <span className="ml-auto text-sm font-medium opacity-80">
          {items.reduce((s, i) => s + i.quantity, 0)} iten{items.length !== 1 ? 's' : ''}
        </span>
      </header>

      <div className="mx-auto w-full max-w-[500px] px-4 py-4 pb-32">
        {/* Items list */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm border border-slate-100"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm leading-tight">
                  {item.name}
                </p>
                {item.notes && (
                  <p className="mt-0.5 text-xs text-slate-400 truncate">{item.notes}</p>
                )}
                <p className="mt-1 text-sm font-bold" style={{ color: primaryColor }}>
                  {formatBRL(item.price * item.quantity)}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-red-400 hover:bg-red-50 transition-colors min-h-[44px] min-w-[44px]"
                  aria-label={`Remover ${item.name}`}
                >
                  <Trash2 size={14} />
                </button>

                {/* Quantity controls */}
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1">
                  <button
                    type="button"
                    onClick={() => updateQty(item.productId, item.quantity - 1)}
                    className="flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px]"
                    aria-label="Diminuir"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.productId, item.quantity + 1)}
                    className="flex h-6 w-6 items-center justify-center rounded text-white transition-opacity hover:opacity-80 min-h-[44px] min-w-[44px]"
                    style={{ backgroundColor: primaryColor }}
                    aria-label="Aumentar"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order notes */}
        <div className="mt-5">
          <label
            htmlFor="order-notes"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Observações do pedido (opcional)
          </label>
          <textarea
            id="order-notes"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Ex: alergias, preferências gerais..."
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[color:var(--pdv-primary)] transition-colors"
            maxLength={500}
          />
        </div>

        {/* Price summary */}
        <div className="mt-5 rounded-xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>{formatBRL(subtotal)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between font-bold text-slate-900">
            <span>Total</span>
            <span style={{ color: primaryColor }}>{formatBRL(subtotal)}</span>
          </div>
        </div>
      </div>

      {/* Sticky continue button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-100 bg-white/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto max-w-[500px]">
          <button
            type="button"
            onClick={() => router.push(`/cardapio/${tenantId}/checkout`)}
            className="w-full rounded-2xl py-4 text-base font-semibold text-white shadow-lg transition-opacity hover:opacity-90 active:scale-[0.98] min-h-[44px]"
            style={{ backgroundColor: primaryColor }}
          >
            Continuar · {formatBRL(subtotal)}
          </button>
        </div>
      </div>
    </div>
  )
}
