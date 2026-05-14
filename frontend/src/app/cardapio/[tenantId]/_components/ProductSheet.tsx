'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Minus, Plus } from 'lucide-react'
import { useMenuCartStore } from '@/features/menu/store/cartStore'
import type { IProduct } from '@/features/products/interfaces/product.interface'

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface ProductSheetProps {
  product: IProduct
  primaryColor: string
  onClose: () => void
}

export function ProductSheet({ product, primaryColor, onClose }: ProductSheetProps) {
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState('')
  const [visible, setVisible] = useState(false)

  const addItem = useMenuCartStore((s) => s.addItem)

  // Animate in
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const handleClose = useCallback(() => {
    setVisible(false)
    // Wait for CSS transition before unmounting
    setTimeout(onClose, 280)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [handleClose])

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      notes: notes.trim() || undefined,
    })
    handleClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleClose}
        aria-hidden
      />

      {/* Sheet panel */}
      <div
        className="relative z-10 w-full max-w-[500px] mx-auto rounded-t-3xl bg-white px-5 py-6 shadow-2xl transition-transform duration-300 ease-out"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
        role="dialog"
        aria-modal
        aria-label={product.name}
      >
        {/* Handle bar */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 min-h-[44px] min-w-[44px]"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>

        {/* Product info */}
        {product.categoryName && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            {product.categoryName}
          </p>
        )}
        <h2 className="text-xl font-bold text-slate-900">{product.name}</h2>
        <p className="mt-1 text-lg font-semibold" style={{ color: primaryColor }}>
          {formatBRL(product.price)}
        </p>

        {/* Notes */}
        <div className="mt-5">
          <label htmlFor="item-notes" className="mb-1 block text-sm font-medium text-slate-600">
            Observações (opcional)
          </label>
          <textarea
            id="item-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: sem cebola, ponto da carne..."
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[color:var(--pdv-primary)] transition-colors"
            maxLength={200}
          />
        </div>

        {/* Quantity + Add to cart */}
        <div className="mt-5 flex items-center gap-4">
          {/* Quantity selector */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40 min-h-[44px] min-w-[44px]"
              disabled={qty <= 1}
              aria-label="Diminuir quantidade"
            >
              <Minus size={16} />
            </button>
            <span
              className="w-6 text-center text-base font-bold text-slate-800"
              aria-live="polite"
            >
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-80 min-h-[44px] min-w-[44px]"
              style={{ backgroundColor: primaryColor }}
              aria-label="Aumentar quantidade"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Add button */}
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98] min-h-[44px]"
            style={{ backgroundColor: primaryColor }}
          >
            Adicionar ao Carrinho · {formatBRL(product.price * qty)}
          </button>
        </div>
      </div>
    </div>
  )
}
