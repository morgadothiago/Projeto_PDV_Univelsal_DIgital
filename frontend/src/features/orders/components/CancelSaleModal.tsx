'use client'

import { TriangleAlert, PackageCheck } from 'lucide-react'

interface CancelSaleModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export function CancelSaleModal({ onConfirm, onCancel }: CancelSaleModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(15,23,42,0.4)' }}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label="Cancelar venda"
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

        {/* Icon area */}
        <div className="flex justify-center px-5 pt-2 pb-4">
          <div
            className="flex h-16 w-16 items-center justify-center bg-[#FEF2F2]"
            style={{ borderRadius: 32 }}
          >
            <TriangleAlert size={28} className="text-[#DC2626]" aria-hidden />
          </div>
        </div>

        {/* Text area */}
        <div className="px-5 flex flex-col gap-2 pb-2">
          <h2 className="text-center text-[20px] font-bold text-[#0F172A]">Cancelar Venda?</h2>
          <p
            className="text-center text-[14px] text-[#64748B]"
            style={{ lineHeight: 1.5 }}
          >
            Esta ação não pode ser desfeita. O carrinho será esvaziado.
          </p>

          {/* Stock note */}
          <div
            className="mt-2 flex items-center gap-2 bg-[#F0FDF4] px-3 py-2.5"
            style={{ borderRadius: 8 }}
          >
            <PackageCheck size={16} className="flex-shrink-0 text-[#16A34A]" aria-hidden />
            <span className="text-[13px] text-[#16A34A]">
              O estoque será restaurado automaticamente.
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 px-5 pb-9 pt-5">
          <button
            onClick={onCancel}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-[#E2E8F0] text-[15px] font-semibold text-[#0F172A]"
            style={{ borderWidth: 1.5 }}
          >
            Voltar
          </button>
          <button
            onClick={onConfirm}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-[#DC2626] text-[15px] font-semibold text-white"
          >
            Cancelar Venda
          </button>
        </div>
      </div>
    </div>
  )
}
