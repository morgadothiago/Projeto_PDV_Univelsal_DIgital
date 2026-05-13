'use client'

import type { ICategory } from '../interfaces/product.interface'

interface CategoryPillsProps {
  categories: ICategory[]
  activeId: string | null
  onSelect: (id: string | null) => void
}

export function CategoryPills({ categories, activeId, onSelect }: CategoryPillsProps) {
  const all = [{ id: null, name: 'Todos' }, ...categories.map((c) => ({ id: c.id, name: c.name }))]

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      role="tablist"
      aria-label="Categorias"
    >
      {all.map(({ id, name }) => {
        const isActive = id === activeId
        return (
          <button
            key={id ?? 'all'}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(id)}
            className={`flex-shrink-0 h-8 md:h-9 px-4 md:px-5 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#2563EB] text-white'
                : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB]'
            }`}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}
