'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, Trash2 } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useCategories } from '@/features/products/hooks/useCategories'
import { productCrudApi } from '@/features/products/api/product-crud.api'
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  price: z.string().min(1, 'Preço é obrigatório'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  type: z.enum(['unit', 'weight', 'digital']),
  stockEnabled: z.boolean(),
  lowStockThreshold: z.string().min(1),
  isActive: z.boolean(),
  customUnit: z.string().max(20).optional(),
})

type FormData = z.infer<typeof schema>

const TYPE_OPTIONS: { value: 'unit' | 'weight' | 'digital'; label: string }[] = [
  { value: 'unit',    label: 'Unidade' },
  { value: 'weight',  label: 'Peso' },
  { value: 'digital', label: 'Digital' },
]

const THRESHOLD_OPTIONS = [5, 10, 15, 20, 25, 50]

interface FieldGroupProps {
  label: string
  children: React.ReactNode
}

function FieldGroup({ label, children }: FieldGroupProps) {
  return (
    <div className="flex flex-col" style={{ gap: '6px' }}>
      <label className="font-medium" style={{ fontSize: '13px', color: '#0F172A' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function toTypeEnum(v: string): 'unit' | 'weight' | 'digital' {
  if (v === 'weight' || v === 'digital') return v
  return 'unit'
}

export default function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: categories = [] } = useCategories()

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productCrudApi.findById(id),
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'unit' as const,
      stockEnabled: true,
      lowStockThreshold: '10',
      isActive: true,
      price: '',
      categoryId: '',
      name: '',
      customUnit: '',
    },
    values: product
      ? {
          name: product.name,
          price: String(product.price),
          categoryId: product.categoryId ?? '',
          type: toTypeEnum(product.unitType),
          stockEnabled: true,
          lowStockThreshold: '10',
          isActive: product.active,
          customUnit: product.customUnit ?? '',
        }
      : undefined,
  })

  const stockEnabled = watch('stockEnabled')

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: (data: FormData) =>
      productCrudApi.update(id, {
        name: data.name,
        price: parseFloat(data.price),
        categoryId: data.categoryId || undefined,
        unitType: data.type,
        stockThreshold: data.stockEnabled ? parseInt(data.lowStockThreshold, 10) : undefined,
        isActive: data.isActive,
        customUnit: data.customUnit || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      toast.success('Produto atualizado!')
      router.push('/produtos')
    },
    onError: () => {
      toast.error('Erro ao atualizar produto')
    },
  })

  const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
    mutationFn: () => productCrudApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto excluído')
      router.push('/produtos')
    },
    onError: () => {
      toast.error('Erro ao excluir produto')
    },
  })

  function onSubmit(data: FormData) {
    updateMutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
        <DashboardSidebar />
        <div className="flex flex-1 items-center justify-center">
          <span style={{ fontSize: '14px', color: '#94A3B8' }}>Carregando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
      <DashboardSidebar />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-between bg-white flex-shrink-0"
          style={{ height: '62px', padding: '0 16px', borderBottom: '1px solid #E2E8F0', gap: '12px' }}
        >
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
          >
            <ArrowLeft size={22} style={{ color: '#0F172A' }} />
          </button>
          <span className="flex-1 font-bold" style={{ fontSize: '18px', color: '#0F172A' }}>
            Editar Produto
          </span>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isUpdating}
            className="font-semibold"
            style={{
              height: '36px',
              padding: '0 14px',
              borderRadius: '8px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontSize: '13px',
              border: 'none',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              opacity: isUpdating ? 0.7 : 1,
            }}
          >
            {isUpdating ? 'Salvando...' : 'Salvar'}
          </button>
        </header>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#F8FAFC' }}>
          <div
            className="flex flex-col mx-auto"
            style={{ gap: '16px', padding: '20px 16px 32px', maxWidth: '672px' }}
          >
            {/* Name */}
            <FieldGroup label="Nome do produto">
              <input
                {...register('name')}
                type="text"
                placeholder="Ex: Café Expresso"
                className="border outline-none"
                style={{
                  height: '48px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  borderColor: errors.name ? '#DC2626' : '#E2E8F0',
                  fontSize: '14px',
                  color: '#0F172A',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
              {errors.name && (
                <span style={{ fontSize: '12px', color: '#DC2626' }}>{errors.name.message}</span>
              )}
            </FieldGroup>

            {/* Price */}
            <FieldGroup label="Preço">
              <div
                className="flex items-center border"
                style={{
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  borderColor: errors.price ? '#DC2626' : '#E2E8F0',
                  overflow: 'hidden',
                }}
              >
                <span
                  className="font-semibold flex-shrink-0"
                  style={{ fontSize: '14px', color: '#64748B', padding: '0 12px 0 14px' }}
                >
                  R$
                </span>
                <input
                  {...register('price')}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className="flex-1 outline-none bg-transparent"
                  style={{ fontSize: '14px', color: '#0F172A', paddingRight: '14px' }}
                />
              </div>
              {errors.price && (
                <span style={{ fontSize: '12px', color: '#DC2626' }}>{errors.price.message}</span>
              )}
            </FieldGroup>

            {/* Category */}
            <FieldGroup label="Categoria">
              <div className="relative">
                <select
                  {...register('categoryId')}
                  className="border appearance-none w-full outline-none"
                  style={{
                    height: '48px',
                    padding: '0 40px 0 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    borderColor: errors.categoryId ? '#DC2626' : '#E2E8F0',
                    fontSize: '14px',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Selecionar categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  style={{ color: '#64748B', position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
              </div>
              {errors.categoryId && (
                <span style={{ fontSize: '12px', color: '#DC2626' }}>{errors.categoryId.message}</span>
              )}
            </FieldGroup>

            {/* Type */}
            <FieldGroup label="Tipo">
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <div className="flex" style={{ gap: '8px' }}>
                    {TYPE_OPTIONS.map((opt) => {
                      const isSelected = field.value === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className="flex-1 font-semibold border"
                          style={{
                            height: '44px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                            borderColor: isSelected ? '#2563EB' : '#E2E8F0',
                            borderWidth: isSelected ? '2px' : '1px',
                            color: isSelected ? '#2563EB' : '#64748B',
                          }}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              />
            </FieldGroup>

            {/* Custom unit */}
            <FieldGroup label="Unidade customizada (opcional)">
              <input
                {...register('customUnit')}
                type="text"
                placeholder="Ex: m, m², m³, L, saco, barra"
                className="border outline-none"
                style={{
                  height: '48px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  fontSize: '14px',
                  color: '#0F172A',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                Deixe vazio para usar a unidade padrão
              </span>
            </FieldGroup>

            {/* Stock toggle */}
            <div
              className="flex items-center justify-between bg-white border rounded-[10px]"
              style={{ padding: '14px 16px', borderColor: '#E2E8F0' }}
            >
              <div className="flex flex-col" style={{ gap: '2px' }}>
                <span className="font-medium" style={{ fontSize: '13px', color: '#0F172A' }}>
                  Controle de estoque
                </span>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Monitorar quantidade disponível em estoque
                </span>
              </div>
              <Controller
                name="stockEnabled"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    aria-label="Toggle controle de estoque"
                    style={{
                      width: '48px',
                      height: '28px',
                      borderRadius: '14px',
                      backgroundColor: field.value ? '#2563EB' : '#CBD5E1',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      flexShrink: 0,
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '3px',
                        left: field.value ? '23px' : '3px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}
                    />
                  </button>
                )}
              />
            </div>

            {/* Threshold */}
            {stockEnabled && (
              <FieldGroup label="Alerta de estoque baixo">
                <div className="relative">
                  <select
                    {...register('lowStockThreshold')}
                    className="border appearance-none w-full outline-none"
                    style={{
                      height: '48px',
                      padding: '0 40px 0 14px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      fontSize: '14px',
                      color: '#0F172A',
                      boxSizing: 'border-box',
                    }}
                  >
                    {THRESHOLD_OPTIONS.map((v) => (
                      <option key={v} value={String(v)}>
                        {v} unidades
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    style={{ color: '#64748B', position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                </div>
              </FieldGroup>
            )}

            {/* Active toggle */}
            <div
              className="flex items-center justify-between bg-white border rounded-[10px]"
              style={{ padding: '14px 16px', borderColor: '#E2E8F0' }}
            >
              <span className="font-medium" style={{ fontSize: '13px', color: '#0F172A' }}>
                Produto ativo
              </span>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    aria-label="Toggle produto ativo"
                    style={{
                      width: '48px',
                      height: '28px',
                      borderRadius: '14px',
                      backgroundColor: field.value ? '#2563EB' : '#CBD5E1',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      flexShrink: 0,
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '3px',
                        left: field.value ? '23px' : '3px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}
                    />
                  </button>
                )}
              />
            </div>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => {
                if (confirm('Tem certeza que deseja excluir este produto?')) {
                  deleteMutate()
                }
              }}
              disabled={isDeleting}
              className="flex items-center justify-center border font-semibold"
              style={{
                height: '48px',
                borderRadius: '10px',
                backgroundColor: '#FEF2F2',
                borderColor: '#FECACA',
                gap: '8px',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                opacity: isDeleting ? 0.7 : 1,
              }}
            >
              <Trash2 size={18} style={{ color: '#DC2626' }} />
              <span style={{ fontSize: '14px', color: '#DC2626' }}>Excluir produto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
