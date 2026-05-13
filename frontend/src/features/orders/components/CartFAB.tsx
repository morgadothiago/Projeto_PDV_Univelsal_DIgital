'use client'

import { ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCartStore, selectItemCount } from '../store/cart.store'

export function CartFAB() {
  const router = useRouter()
  const itemCount = useCartStore(selectItemCount)

  if (itemCount === 0) return null

  return (
    <div className="flex md:hidden h-20 flex-shrink-0 items-center justify-center bg-[#F8FAFC]">
      <button
        onClick={() => router.push('/checkout')}
        aria-label={`Ver carrinho com ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
        className="flex h-14 w-[220px] items-center justify-center gap-2.5 rounded-full bg-[#2563EB] shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-opacity hover:opacity-90"
      >
        <ShoppingCart size={20} className="text-white" aria-hidden />
        <span className="text-sm font-semibold text-white">
          Ver Carrinho ({itemCount})
        </span>
      </button>
    </div>
  )
}
