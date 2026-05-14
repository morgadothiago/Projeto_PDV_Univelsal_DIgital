'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Banknote, CreditCard, QrCode } from 'lucide-react'
import { useMenuTenant } from '@/features/menu/hooks/useMenu'
import { useCreateMenuOrder } from '@/features/menu/hooks/useMenu'
import { useMenuCartStore } from '@/features/menu/store/cartStore'

type PaymentMethod = 'pix' | 'card' | 'cash'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function StepIndicator({
  step,
  current,
  label,
  primaryColor,
}: {
  step: number
  current: number
  label: string
  primaryColor: string
}) {
  const done = current > step
  const active = current === step
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors"
        style={
          done || active
            ? { backgroundColor: primaryColor, color: '#fff' }
            : { backgroundColor: '#E2E8F0', color: '#94A3B8' }
        }
      >
        {done ? '✓' : step}
      </div>
      <span
        className="text-[10px] font-medium"
        style={{ color: active ? primaryColor : '#94A3B8' }}
      >
        {label}
      </span>
    </div>
  )
}

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'pix', label: 'PIX', icon: <QrCode size={18} /> },
  { value: 'card', label: 'Cartão', icon: <CreditCard size={18} /> },
  { value: 'cash', label: 'Dinheiro', icon: <Banknote size={18} /> },
]

export default function CheckoutPage({
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
  const total = useMenuCartStore((s) => s.total)
  const clearCart = useMenuCartStore((s) => s.clearCart)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [tableRef, setTableRef] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')

  const { mutate: createOrder, isPending, isError, error } = useCreateMenuOrder(tenantId)

  if (items.length === 0) {
    router.replace(`/cardapio/${tenantId}`)
    return null
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    createOrder(
      {
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        tableRef: tableRef.trim() || undefined,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
        notes: orderNotes.trim() || undefined,
      },
      {
        onSuccess: (result) => {
          // Persist result for confirmation page
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              `pdv-order-${tenantId}`,
              JSON.stringify({
                ...result,
                tenantName: tenant?.name ?? '',
              }),
            )
          }
          clearCart()
          router.push(`/cardapio/${tenantId}/confirmado`)
        },
      },
    )
  }

  const subtotal = total()

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
          href={`/cardapio/${tenantId}/carrinho`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 min-h-[44px] min-w-[44px]"
          aria-label="Voltar ao carrinho"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-base font-bold">Finalizar Pedido</h1>
      </header>

      {/* Step indicator */}
      <div className="bg-white border-b border-slate-100 px-6 py-3">
        <div className="mx-auto flex max-w-[500px] items-center justify-between">
          <StepIndicator step={1} current={2} label="Carrinho" primaryColor={primaryColor} />
          <div className="flex-1 h-px mx-2" style={{ backgroundColor: primaryColor }} />
          <StepIndicator step={2} current={2} label="Dados" primaryColor={primaryColor} />
          <div className="flex-1 h-px mx-2 bg-slate-200" />
          <StepIndicator step={3} current={2} label="Confirmação" primaryColor={primaryColor} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-[500px] px-4 py-5 pb-36 space-y-5"
      >
        {/* Customer info */}
        <section className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 space-y-4">
          <h2 className="font-semibold text-slate-800">Seus dados (opcional)</h2>

          <div>
            <label htmlFor="customer-name" className="mb-1 block text-sm text-slate-600">
              Nome
            </label>
            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="João Silva"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[color:var(--pdv-primary)] transition-colors"
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="customer-phone" className="mb-1 block text-sm text-slate-600">
              WhatsApp
            </label>
            <input
              id="customer-phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[color:var(--pdv-primary)] transition-colors"
              maxLength={20}
            />
          </div>

          <div>
            <label htmlFor="table-ref" className="mb-1 block text-sm text-slate-600">
              Mesa / Local
            </label>
            <input
              id="table-ref"
              type="text"
              value={tableRef}
              onChange={(e) => setTableRef(e.target.value)}
              placeholder="Mesa 4, Área externa..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[color:var(--pdv-primary)] transition-colors"
              maxLength={50}
            />
          </div>
        </section>

        {/* Payment method */}
        <section className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
          <h2 className="mb-3 font-semibold text-slate-800">Forma de pagamento</h2>
          <div className="grid grid-cols-3 gap-3">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPaymentMethod(opt.value)}
                className="flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 text-xs font-semibold transition-colors min-h-[44px]"
                style={
                  paymentMethod === opt.value
                    ? {
                        borderColor: primaryColor,
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                      }
                    : {
                        borderColor: '#E2E8F0',
                        backgroundColor: '#F8FAFC',
                        color: '#64748B',
                      }
                }
                aria-pressed={paymentMethod === opt.value}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Order summary */}
        <section className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
          <h2 className="mb-3 font-semibold text-slate-800">Resumo do pedido</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-slate-600 truncate mr-3">
                  {item.quantity}× {item.name}
                </span>
                <span className="shrink-0 font-medium text-slate-800">
                  {formatBRL(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-900">
            <span>Total</span>
            <span style={{ color: primaryColor }}>{formatBRL(subtotal)}</span>
          </div>
        </section>

        {/* API Error */}
        {isError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600 font-medium">
              Erro ao criar pedido. Tente novamente.
            </p>
            {error instanceof Error && (
              <p className="text-xs text-red-400 mt-0.5">{error.message}</p>
            )}
          </div>
        )}
      </form>

      {/* Sticky confirm button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-100 bg-white/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto max-w-[500px]">
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white shadow-lg transition-opacity disabled:opacity-60 min-h-[44px]"
            style={{ backgroundColor: primaryColor }}
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Confirmando...
              </>
            ) : (
              `Confirmar Pedido · ${formatBRL(subtotal)}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
