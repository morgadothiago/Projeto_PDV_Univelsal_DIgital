'use client'

import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Share2,
  Check,
  Printer,
  Copy,
  Plus,
  Banknote,
} from 'lucide-react'
import { useOrderStore } from '@/features/orders/store/order.store'
import { useCartStore } from '@/features/orders/store/cart.store'

const PAYMENT_LABEL: Record<string, string> = {
  pix: 'PIX',
  cash: 'Dinheiro',
  card: 'Cartão',
}

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ReciboPage() {
  const router = useRouter()
  const lastOrder = useOrderStore((s) => s.lastOrder)
  const clearOrder = useOrderStore((s) => s.clearOrder)
  const clearCart = useCartStore((s) => s.clearCart)

  function handleNewSale() {
    clearCart()
    clearOrder()
    router.push('/pdv')
  }

  if (!lastOrder) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[#64748B]">Nenhum pedido encontrado.</p>
          <button
            onClick={() => router.push('/pdv')}
            className="flex h-10 items-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white"
          >
            <Plus size={16} aria-hidden />
            Nova Venda
          </button>
        </div>
      </div>
    )
  }

  const orderDate = new Date(lastOrder.createdAt)
  const dateStr = orderDate.toLocaleDateString('pt-BR')
  const timeStr = orderDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const orderShort = lastOrder.orderId.slice(-4).toUpperCase()
  const paymentLabel = PAYMENT_LABEL[lastOrder.paymentMethod] ?? lastOrder.paymentMethod

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex h-[62px] flex-shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} aria-label="Voltar">
            <ArrowLeft size={22} className="text-[#0F172A]" aria-hidden />
          </button>
          <span className="text-[18px] font-bold text-[#0F172A]">Recibo</span>
        </div>
        <button aria-label="Compartilhar recibo">
          <Share2 size={22} className="text-[#64748B]" aria-hidden />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-6 flex flex-col gap-5">
        {/* Success badge */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex h-[72px] w-[72px] items-center justify-center bg-[#DCFCE7]"
            style={{ borderRadius: 36 }}
          >
            <Check size={36} className="text-[#16A34A]" aria-hidden />
          </div>
          <span className="text-[20px] font-bold text-[#0F172A]">Venda Finalizada!</span>
          <span className="text-[13px] text-[#64748B]">
            Pedido #{orderShort} · {dateStr} às {timeStr}
          </span>
        </div>

        {/* Summary card */}
        <div
          className="flex flex-col bg-white border border-[#E2E8F0]"
          style={{ borderRadius: 12 }}
        >
          {/* Title row */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <span className="text-[13px] font-semibold text-[#0F172A]">Resumo da Venda</span>
            <span className="text-[12px] text-[#64748B]">Minha Loja</span>
          </div>
          <div className="h-px bg-[#E2E8F0]" />

          {/* Items */}
          <div className="flex flex-col gap-2.5 px-4 py-3">
            {lastOrder.items.map((item, idx) => {
              const lineTotal = fmt(item.price * item.quantity)
              return (
                <div
                  key={`${item.productId}-${idx}`}
                  className="flex items-center justify-between"
                >
                  <span className="text-[13px] text-[#0F172A]">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-[13px] text-[#0F172A]">{lineTotal}</span>
                </div>
              )
            })}
          </div>

          <div className="h-px bg-[#E2E8F0]" />

          {/* Total row */}
          <div className="flex items-center justify-between px-4 pt-3 pb-4">
            <span className="text-[16px] font-bold text-[#0F172A]">Total</span>
            <span className="text-[18px] font-bold text-[#2563EB]">{fmt(lastOrder.total)}</span>
          </div>
        </div>

        {/* Payment info */}
        <div
          className="flex items-center gap-2.5 border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-3"
          style={{ borderRadius: 10 }}
        >
          <Banknote size={20} className="flex-shrink-0 text-[#16A34A]" aria-hidden />
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] text-[#16A34A]">Pagamento: {paymentLabel}</span>
          </div>
        </div>

        {/* Action row */}
        <div className="flex gap-2.5">
          <button
            className="flex flex-1 h-12 items-center justify-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A]"
            aria-label="Imprimir recibo"
          >
            <Printer size={16} aria-hidden />
            Imprimir
          </button>
          <button
            className="flex flex-1 h-12 items-center justify-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A]"
            aria-label="Copiar recibo"
          >
            <Copy size={16} aria-hidden />
            Copiar
          </button>
        </div>

        {/* New sale button */}
        <button
          onClick={handleNewSale}
          className="flex h-14 items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-[15px] font-bold text-white"
        >
          <Plus size={20} aria-hidden />
          Nova Venda
        </button>
      </div>
    </div>
  )
}
