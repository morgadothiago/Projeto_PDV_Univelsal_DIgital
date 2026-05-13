'use client'

import type { IOrder } from '../interfaces/order.interface'

interface ReceiptCardProps {
  order: IOrder
  storeName?: string
}

const PAYMENT_LABEL: Record<string, string> = {
  pix: 'PIX',
  cash: 'Dinheiro',
  card: 'Cartão',
}

export function ReceiptCard({ order, storeName = 'Minha Loja' }: ReceiptCardProps) {
  const total = order.total.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  return (
    <div
      className="flex flex-col bg-white border border-[#E2E8F0]"
      style={{ borderRadius: 12 }}
    >
      {/* Title row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <span className="text-[13px] font-semibold text-[#0F172A]">Resumo da Venda</span>
        <span className="text-[12px] text-[#64748B]">{storeName}</span>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E2E8F0]" />

      {/* Items */}
      <div className="flex flex-col gap-2.5 px-4 py-3">
        {order.items.map((item, idx) => {
          const lineTotal = (item.price * item.quantity).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
          return (
            <div key={`${item.productId}-${idx}`} className="flex items-center justify-between">
              <span className="text-[13px] text-[#0F172A]">
                {item.name} × {item.quantity}
              </span>
              <span className="text-[13px] text-[#0F172A]">{lineTotal}</span>
            </div>
          )
        })}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E2E8F0]" />

      {/* Total row */}
      <div className="flex items-center justify-between px-4 pt-3 pb-4">
        <span className="text-[16px] font-bold text-[#0F172A]">Total</span>
        <span className="text-[18px] font-bold text-[#2563EB]">{total}</span>
      </div>

      {/* Payment info */}
      <div
        className="mx-4 mb-4 flex items-center gap-2.5 border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-3"
        style={{ borderRadius: 10 }}
      >
        <span className="text-[13px] text-[#16A34A]">
          Pagamento: {PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}
        </span>
      </div>
    </div>
  )
}
