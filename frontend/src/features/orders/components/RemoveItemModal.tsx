'use client'

import { Box, TriangleAlert } from 'lucide-react'
import type { CartItem } from '../store/cart.store'

interface RemoveItemModalProps {
  item: CartItem
  onConfirm: () => void
  onCancel: () => void
}

export function RemoveItemModal({ item, onConfirm, onCancel }: RemoveItemModalProps) {
  const unitPrice = item.price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(15,23,42,0.4)' }}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label="Remover item do carrinho"
    >
      {/* Bottom sheet */}
      <div
        className="w-full bg-white"
        style={{ borderRadius: '24px 24px 0 0' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex h-7 items-center justify-center">
          <div
            className="h-1 w-10 bg-[#E2E8F0]"
            style={{ borderRadius: 2 }}
          />
        </div>

        {/* Header */}
        <div className="px-5 pb-4 flex flex-col gap-1">
          <h2 className="text-[18px] font-bold text-[#0F172A]">Remover Item</h2>
          <p className="text-[13px] text-[#64748B]">Revise os dados antes de confirmar</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#E2E8F0]" />

        {/* Product info */}
        <div className="px-5 py-4 flex flex-col gap-3">
          {/* Product row */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-[#EFF6FF]"
              style={{ borderRadius: 8 }}
            >
              <Box size={20} className="text-[#2563EB]" aria-hidden />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-[#0F172A]">{item.name}</span>
              <span className="text-[12px] text-[#64748B]">{unitPrice} / un</span>
            </div>
          </div>

          {/* Warning */}
          <div
            className="flex items-center gap-2 bg-[#FEF2F2] px-3 py-2.5"
            style={{ borderRadius: 8 }}
          >
            <TriangleAlert size={16} className="flex-shrink-0 text-[#DC2626]" aria-hidden />
            <span className="text-[13px] text-[#DC2626]">
              Tem certeza que deseja remover este item do carrinho?
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 px-5 pb-8 pt-2">
          <button
            onClick={onCancel}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-[#E2E8F0] text-[15px] font-semibold text-[#0F172A]"
            style={{ borderWidth: 1.5 }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-[#DC2626] text-[15px] font-semibold text-white"
          >
            Remover Item
          </button>
        </div>
      </div>
    </div>
  )
}
