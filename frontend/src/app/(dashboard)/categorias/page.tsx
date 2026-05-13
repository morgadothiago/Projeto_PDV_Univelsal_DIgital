'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCategories } from '@/features/products/hooks/useCategories'
import { productCrudApi } from '@/features/products/api/product-crud.api'
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar'

const DOT_COLORS = ['#2563EB', '#16A34A', '#EA580C', '#9333EA']

function getDotColor(index: number): string {
  return DOT_COLORS[index % DOT_COLORS.length]
}

export default function CategoriasPage() {
  const [newName, setNewName] = useState('')
  const queryClient = useQueryClient()
  const { data: categories = [], isLoading } = useCategories()

  const { mutate: createCategory, isPending } = useMutation({
    mutationFn: () => productCrudApi.createCategory(newName.trim()),
    onSuccess: () => {
      setNewName('')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  function handleAdd() {
    if (!newName.trim()) return
    createCategory()
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      <DashboardSidebar />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center bg-white flex-shrink-0"
          style={{ height: '62px', padding: '0 16px', borderBottom: '1px solid #E2E8F0' }}
        >
          <span className="font-bold" style={{ fontSize: '18px', color: '#0F172A' }}>
            Categorias
          </span>
        </header>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto pb-16 md:pb-0"
          style={{ backgroundColor: '#F8FAFC' }}
        >
          <div
            className="flex flex-col mx-auto"
            style={{ gap: '16px', padding: '16px', maxWidth: '672px' }}
          >
            {/* Inline form */}
            <div
              className="flex flex-col bg-white border rounded-[12px]"
              style={{ padding: '16px', borderColor: '#E2E8F0', gap: '12px' }}
            >
              <span className="font-bold" style={{ fontSize: '14px', color: '#0F172A' }}>
                Nova Categoria
              </span>
              <div className="flex" style={{ gap: '10px' }}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="Nome da categoria"
                  className="flex-1 border outline-none"
                  style={{
                    height: '44px',
                    padding: '0 14px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    borderColor: '#E2E8F0',
                    fontSize: '14px',
                    color: '#0F172A',
                  }}
                />
                <button
                  onClick={handleAdd}
                  disabled={isPending || !newName.trim()}
                  className="font-medium flex-shrink-0"
                  style={{
                    height: '44px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    border: 'none',
                    cursor: isPending || !newName.trim() ? 'not-allowed' : 'pointer',
                    opacity: isPending || !newName.trim() ? 0.7 : 1,
                  }}
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Section label */}
            <span className="font-semibold" style={{ fontSize: '13px', color: '#64748B' }}>
              Categorias existentes
            </span>

            {/* Category list */}
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-[10px]"
                  style={{ height: '52px', backgroundColor: '#E2E8F0' }}
                />
              ))
            ) : categories.length === 0 ? (
              <div className="flex items-center justify-center" style={{ paddingTop: '24px' }}>
                <span style={{ fontSize: '14px', color: '#94A3B8' }}>
                  Nenhuma categoria ainda
                </span>
              </div>
            ) : (
              <div className="flex flex-col" style={{ gap: '8px' }}>
                {categories.map((cat, index) => (
                  <div
                    key={cat.id}
                    className="flex items-center bg-white border rounded-[10px]"
                    style={{ height: '52px', padding: '0 16px', borderColor: '#E2E8F0', gap: '12px' }}
                  >
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '5px',
                        backgroundColor: getDotColor(index),
                        flexShrink: 0,
                      }}
                    />
                    <span className="flex-1 font-medium" style={{ fontSize: '14px', color: '#0F172A' }}>
                      {cat.name}
                    </span>
                    <button
                      aria-label={`Editar ${cat.name}`}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
                    >
                      <Pencil size={16} style={{ color: '#94A3B8' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
