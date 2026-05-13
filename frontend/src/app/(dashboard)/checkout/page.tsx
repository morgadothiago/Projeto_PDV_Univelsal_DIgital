'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Banknote,
  QrCode,
  CreditCard,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore, selectTotal } from '@/features/orders/store/cart.store'
import { useOrderStore } from '@/features/orders/store/order.store'
import { useCreateOrder } from '@/features/orders/hooks/useCreateOrder'
import { orderApi } from '@/features/orders/api/order.api'
import { RemoveItemModal } from '@/features/orders/components/RemoveItemModal'
import { CancelSaleModal } from '@/features/orders/components/CancelSaleModal'
import { Sidebar } from '@/components/shared/Sidebar'
import type { CartItem } from '@/features/orders/store/cart.store'

// ─── Design tokens ───────────────────────────────────────────────────────────

const PAYMENT_OPTIONS = [
  { id: 'cash' as const, label: 'Dinheiro', Icon: Banknote },
  { id: 'pix' as const, label: 'PIX', Icon: QrCode },
  { id: 'card' as const, label: 'Cartão', Icon: CreditCard },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface CheckoutCartItemRowProps {
  item: CartItem
  onDecrease: (item: CartItem) => void
  onIncrease: (productId: string, qty: number) => void
}

function CheckoutCartItemRow({ item, onDecrease, onIncrease }: CheckoutCartItemRowProps) {
  const subtotal = item.price * item.quantity

  return (
    <div
      className="flex items-center gap-3 rounded-[10px] border border-[#E2E8F0] bg-white px-3.5 py-3"
    >
      {/* Left: name + unit price */}
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className="text-[14px] font-semibold text-[#0F172A] truncate">{item.name}</span>
        <span className="text-[12px] text-[#64748B]">{fmt(item.price)} / un</span>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDecrease(item)}
          aria-label="Diminuir quantidade"
          className="flex h-7 w-7 items-center justify-center bg-[#F1F5F9]"
          style={{ borderRadius: 6 }}
        >
          <span className="text-[#0F172A] text-lg leading-none select-none">−</span>
        </button>
        <span className="text-[14px] font-semibold text-[#0F172A] w-5 text-center">
          {item.quantity}
        </span>
        <button
          onClick={() => onIncrease(item.productId, item.quantity + 1)}
          aria-label="Aumentar quantidade"
          className="flex h-7 w-7 items-center justify-center bg-[#2563EB]"
          style={{ borderRadius: 6 }}
        >
          <span className="text-white text-lg leading-none select-none">+</span>
        </button>
      </div>

      {/* Total */}
      <span className="text-[14px] font-bold text-[#0F172A] w-16 text-right">
        {fmt(subtotal)}
      </span>
    </div>
  )
}

// ─── PIX QR Dialog ───────────────────────────────────────────────────────────

interface PixDialogProps {
  qrCode: string
  orderId: string
  onClose: () => void
}

function PixDialog({ qrCode, orderId, onClose }: PixDialogProps) {
  const router = useRouter()

  function handleConfirm() {
    onClose()
    router.push('/recibo')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ backgroundColor: 'rgba(15,23,42,0.5)' }}
      role="dialog"
      aria-modal="true"
      aria-label="QR Code PIX"
    >
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-bold text-[#0F172A]">Pagar com PIX</span>
          <button onClick={onClose} aria-label="Fechar">
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>
        <p className="text-[13px] text-[#64748B]">Pedido #{orderId}</p>
        <div className="flex items-center justify-center rounded-xl border border-[#E2E8F0] p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrCode)}`}
            alt="QR Code PIX"
            width={180}
            height={180}
          />
        </div>
        <p className="text-center text-[12px] text-[#64748B] break-all">{qrCode}</p>
        <button
          onClick={handleConfirm}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#16A34A] text-[15px] font-semibold text-white"
        >
          <Check size={18} aria-hidden />
          Confirmar Pagamento
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const paymentMethod = useCartStore((s) => s.paymentMethod)
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)
  const total = useCartStore(selectTotal)

  const lastOrder = useOrderStore((s) => s.lastOrder)
  const clearOrder = useOrderStore((s) => s.clearOrder)

  const { mutate: createOrder, isPending } = useCreateOrder()

  const [removeModalItem, setRemoveModalItem] = useState<CartItem | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [pixQrData, setPixQrData] = useState<{ qrCode: string; orderId: string } | null>(null)
  const [lowStockWarning, setLowStockWarning] = useState<{ name: string; available: number } | null>(null)

  const canFinish = items.length > 0 && paymentMethod !== null && !isPending

  // Generate a dummy order number for display
  const orderNumber = lastOrder?.orderId
    ? lastOrder.orderId.slice(-4).toUpperCase()
    : Math.floor(Math.random() * 9000 + 1000).toString()

  function handleDecrease(item: CartItem) {
    if (item.quantity <= 1) {
      setRemoveModalItem(item)
    } else {
      updateQuantity(item.productId, item.quantity - 1)
    }
  }

  function handleRemoveConfirm() {
    if (removeModalItem) {
      updateQuantity(removeModalItem.productId, 0)
      setRemoveModalItem(null)
    }
  }

  async function handleCancelConfirm() {
    if (pixQrData?.orderId) {
      try { await orderApi.cancel(pixQrData.orderId) } catch { /* ignora */ }
    }
    clearCart()
    setShowCancelModal(false)
    router.push('/venda-cancelada')
  }

  function submitOrder() {
    if (!paymentMethod) return
    createOrder(
      {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod,
      },
      {
        onSuccess: (order) => {
          if (order.payment?.pixQrCode) {
            setPixQrData({ qrCode: order.payment.pixQrCode, orderId: order.orderId })
          } else {
            router.push('/recibo')
          }
        },
      }
    )
  }

  function handleFinish() {
    if (!paymentMethod) return

    // Stock validation warning
    const insufficientItem = items.find(
      (item) => item.stockEnabled && item.quantity > item.stock
    )
    if (insufficientItem) {
      toast.warning(
        `Atenção: produto "${insufficientItem.name}" com estoque insuficiente (${insufficientItem.stock} disponíveis). Confirme para continuar mesmo assim.`
      )
      setLowStockWarning({ name: insufficientItem.name, available: insufficientItem.stock })
      return
    }

    submitOrder()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* ── Mobile: header ──────────────────────────────────────────── */}
        <div className="flex md:hidden h-[62px] flex-shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Voltar"
              className="text-[#0F172A]"
            >
              <ArrowLeft size={22} aria-hidden />
            </button>
            <span className="text-[18px] font-bold text-[#0F172A]">Carrinho</span>
          </div>
          <button
            onClick={() => setShowCancelModal(true)}
            className="text-[14px] text-[#DC2626]"
          >
            Limpar
          </button>
        </div>

        {/* ── Desktop: top bar ────────────────────────────────────────── */}
        <div className="hidden md:flex h-16 flex-shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Voltar"
              className="flex h-9 w-9 items-center justify-center bg-[#F1F5F9]"
              style={{ borderRadius: 8 }}
            >
              <ArrowLeft size={18} className="text-[#0F172A]" aria-hidden />
            </button>
            <span className="text-[18px] font-bold text-[#0F172A]">Finalizar Venda</span>
          </div>
          <span className="text-[13px] text-[#64748B]">Pedido #{orderNumber}</span>
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 flex-col md:flex-row md:gap-6 md:p-8 overflow-y-auto md:overflow-hidden">

          {/* ── Mobile content (scrollable) ─────────────────────────── */}
          <div className="flex flex-col md:hidden flex-1 overflow-y-auto">
            {/* Items section */}
            <div className="flex flex-col gap-3 px-4 pt-4 pb-0">
              <span className="text-[13px] font-semibold text-[#64748B]">Itens do pedido</span>
              {items.map((item) => (
                <CheckoutCartItemRow
                  key={item.productId}
                  item={item}
                  onDecrease={handleDecrease}
                  onIncrease={updateQuantity}
                />
              ))}
              {items.length === 0 && (
                <p className="py-8 text-center text-sm text-[#64748B]">
                  Nenhum item no carrinho.
                </p>
              )}
            </div>

            {/* Checkout panel */}
            <div className="mt-auto border-t border-[#E2E8F0] bg-white px-5 pt-5 pb-8 flex flex-col gap-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-[#64748B]">Subtotal</span>
                <span className="text-[14px] font-semibold text-[#0F172A]">{fmt(total)}</span>
              </div>

              {/* Payment method */}
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-semibold text-[#0F172A]">
                  Forma de pagamento
                </span>
                <div className="flex gap-2">
                  {PAYMENT_OPTIONS.map(({ id, label, Icon }) => {
                    const active = paymentMethod === id
                    return (
                      <button
                        key={id}
                        onClick={() => setPaymentMethod(id)}
                        aria-pressed={active}
                        className="flex flex-1 h-16 flex-col items-center justify-center gap-1"
                        style={{
                          borderRadius: 10,
                          border: active ? '2px solid #2563EB' : '1px solid #E2E8F0',
                          background: active ? '#EFF6FF' : '#F8FAFC',
                        }}
                      >
                        <Icon
                          size={20}
                          className={active ? 'text-[#2563EB]' : 'text-[#64748B]'}
                          aria-hidden
                        />
                        <span
                          className="text-[11px] font-semibold"
                          style={{ color: active ? '#2563EB' : '#64748B' }}
                        >
                          {label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Finish button */}
              <button
                onClick={handleFinish}
                disabled={!canFinish}
                aria-label="Finalizar venda"
                className="flex h-14 items-center justify-center gap-2 rounded-xl bg-[#16A34A] text-[15px] font-bold text-white transition-opacity disabled:opacity-40"
              >
                <Check size={22} aria-hidden />
                {isPending ? 'Processando...' : `Finalizar Venda — ${fmt(total)}`}
              </button>
            </div>
          </div>

          {/* ── Desktop: order card + pay card ──────────────────────── */}

          {/* Order card */}
          <div
            className="hidden md:flex flex-1 flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm overflow-y-auto"
          >
            <span className="text-[15px] font-bold text-[#0F172A]">Itens do Pedido</span>
            {items.map((item) => {
              const subtotal = item.price * item.quantity
              return (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 border-b border-[#F1F5F9] py-3 last:border-0"
                >
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-[#EFF6FF]"
                    style={{ borderRadius: 8 }}
                  >
                    <span className="text-[14px] font-bold text-[#2563EB]">
                      {item.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-[14px] font-semibold text-[#0F172A]">{item.name}</span>
                    <span className="text-[12px] text-[#64748B]">{fmt(item.price)} / un</span>
                  </div>
                  <span className="text-[13px] text-[#64748B]">× {item.quantity}</span>
                  <span className="text-[14px] font-semibold text-[#0F172A] w-20 text-right">
                    {fmt(subtotal)}
                  </span>
                </div>
              )
            })}
            {items.length === 0 && (
              <p className="py-12 text-center text-sm text-[#64748B]">
                Nenhum item no carrinho.
              </p>
            )}
            {/* Total row */}
            <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-4">
              <span className="text-[15px] font-bold text-[#0F172A]">Total</span>
              <span className="text-[15px] font-bold text-[#2563EB]">{fmt(total)}</span>
            </div>
          </div>

          {/* Pay card */}
          <div
            className="hidden md:flex w-[360px] flex-shrink-0 flex-col gap-5 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm"
          >
            <span className="text-[15px] font-bold text-[#0F172A]">Pagamento</span>

            <div className="flex flex-col gap-2.5">
              {PAYMENT_OPTIONS.map(({ id, label, Icon }) => {
                const active = paymentMethod === id
                return (
                  <button
                    key={id}
                    onClick={() => setPaymentMethod(id)}
                    aria-pressed={active}
                    className="flex h-[52px] items-center gap-3 px-4"
                    style={{
                      borderRadius: 10,
                      border: active ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      background: active ? '#EFF6FF' : 'transparent',
                    }}
                  >
                    <Icon
                      size={20}
                      className={active ? 'text-[#2563EB]' : 'text-[#64748B]'}
                      aria-hidden
                    />
                    <span
                      className="text-[14px] font-medium"
                      style={{ color: active ? '#2563EB' : '#64748B' }}
                    >
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleFinish}
              disabled={!canFinish}
              className="flex h-14 items-center justify-center gap-2.5 rounded-[10px] bg-[#16A34A] text-[15px] font-bold text-white transition-opacity disabled:opacity-40"
            >
              <Check size={20} aria-hidden />
              {isPending ? 'Processando...' : 'Finalizar Venda'}
            </button>

            <button
              onClick={() => setShowCancelModal(true)}
              className="text-[14px] text-[#DC2626] hover:underline"
            >
              Cancelar venda
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {removeModalItem && (
        <RemoveItemModal
          item={removeModalItem}
          onConfirm={handleRemoveConfirm}
          onCancel={() => setRemoveModalItem(null)}
        />
      )}

      {showCancelModal && (
        <CancelSaleModal
          onConfirm={handleCancelConfirm}
          onCancel={() => setShowCancelModal(false)}
        />
      )}

      {pixQrData && (
        <PixDialog
          qrCode={pixQrData.qrCode}
          orderId={pixQrData.orderId}
          onClose={() => setPixQrData(null)}
        />
      )}

      {lowStockWarning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ backgroundColor: 'rgba(15,23,42,0.5)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Aviso de estoque insuficiente"
        >
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle size={22} className="text-[#F59E0B] flex-shrink-0" aria-hidden />
              <span className="text-[16px] font-bold text-[#0F172A]">Estoque insuficiente</span>
            </div>
            <p className="text-[13px] text-[#64748B]">
              O produto <strong>&quot;{lowStockWarning.name}&quot;</strong> tem apenas{' '}
              <strong>{lowStockWarning.available}</strong> unidade(s) disponível(is). Deseja continuar mesmo assim?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setLowStockWarning(null)}
                className="flex flex-1 h-11 items-center justify-center rounded-xl border border-[#E2E8F0] text-[14px] font-semibold text-[#64748B]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setLowStockWarning(null)
                  submitOrder()
                }}
                className="flex flex-1 h-11 items-center justify-center rounded-xl bg-[#F59E0B] text-[14px] font-semibold text-white"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
