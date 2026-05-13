'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem as CartItemType } from '../store/cart.store'

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const subtotal = item.price * item.quantity

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
      {/* Name + unit + remove */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#0F172A] truncate">{item.name}</p>
          <p className="text-xs text-[#64748B]">{item.unitType}</p>
        </div>
        <button
          onClick={() => onRemove(item.productId)}
          aria-label={`Remover ${item.name}`}
          className="text-[#94A3B8] hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
        >
          <Trash2 size={14} aria-hidden />
        </button>
      </div>

      {/* Qty controls + subtotal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
            aria-label="Diminuir quantidade"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
          >
            <Minus size={12} aria-hidden />
          </button>
          <span className="w-6 text-center text-sm font-medium text-[#0F172A]" aria-label="Quantidade">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
            aria-label="Aumentar quantidade"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
          >
            <Plus size={12} aria-hidden />
          </button>
        </div>
        <span className="text-[13px] font-bold text-[#2563EB]">
          {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>
    </div>
  )
}
