'use client'

import { Check } from 'lucide-react'
import { useCartStore, selectTotal } from '../store/cart.store'
import { CartItem } from './CartItem'

const PAYMENT_METHODS = [
  { id: 'pix' as const, label: 'PIX' },
  { id: 'cash' as const, label: 'Dinheiro' },
  { id: 'card' as const, label: 'Cartão' },
]

export function CartPanel() {
  const items = useCartStore((s) => s.items)
  const paymentMethod = useCartStore((s) => s.paymentMethod)
  const clearCart = useCartStore((s) => s.clearCart)
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const total = useCartStore(selectTotal)

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const canFinish = items.length > 0 && paymentMethod !== null

  return (
    <aside className="hidden md:flex w-[380px] flex-shrink-0 flex-col border-l border-[#E2E8F0] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[#0F172A]">Carrinho</span>
          {itemCount > 0 && (
            <span className="rounded-xl bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-medium text-[#2563EB]">
              {itemCount}
            </span>
          )}
        </div>
        <button
          onClick={clearCart}
          className="text-[13px] text-[#DC2626] hover:underline"
          aria-label="Limpar carrinho"
        >
          Limpar
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-[#64748B]">
            <p className="text-sm">Nenhum produto no carrinho.</p>
          </div>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#E2E8F0] bg-white px-4 py-4 flex flex-col gap-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#64748B]">Subtotal</span>
          <span className="text-sm font-semibold text-[#0F172A]">
            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>

        {/* Payment method */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-[#64748B]">Forma de pagamento</span>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setPaymentMethod(id)}
                aria-pressed={paymentMethod === id}
                className={`flex-1 h-9 rounded-full text-sm font-medium border transition-colors ${
                  paymentMethod === id
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Finish button */}
        <button
          disabled={!canFinish}
          aria-label="Finalizar venda"
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#16A34A] text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Check size={18} aria-hidden />
          Finalizar Venda
        </button>
      </div>
    </aside>
  )
}
