'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, ShoppingBasket, Trash2 } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useCategories } from '@/features/products/hooks/useCategories'
import { productCrudApi } from '@/features/products/api/product-crud.api'
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar'
import { useTenantStore } from '@/store/useTenantStore'

// ── Color helpers (self-contained copy from ProductCard) ──────────────────────
const BG_COLORS = [
  { bg: '#EFF6FF', icon: '#2563EB' },
  { bg: '#F0FDF4', icon: '#16A34A' },
  { bg: '#FFF7ED', icon: '#EA580C' },
  { bg: '#FDF4FF', icon: '#9333EA' },
  { bg: '#FFF1F2', icon: '#E11D48' },
]

function getColorIndex(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % BG_COLORS.length
}

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
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

// ── FieldGroup ────────────────────────────────────────────────────────────────
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

// ── Toggle ────────────────────────────────────────────────────────────────────
interface ToggleProps {
  value: boolean
  onChange: (v: boolean) => void
  ariaLabel: string
}

function Toggle({ value, onChange, ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-label={ariaLabel}
      style={{
        width: '48px',
        height: '28px',
        borderRadius: '14px',
        backgroundColor: value ? '#2563EB' : '#CBD5E1',
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
          left: value ? '23px' : '3px',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )
}

// ── ImageArea ─────────────────────────────────────────────────────────────────
interface ImageAreaProps {
  imageUrl: string | undefined
  name: string
  height: number
  roundedTop?: boolean
}

function ImageArea({ imageUrl, name, height, roundedTop }: ImageAreaProps) {
  const [imgError, setImgError] = useState(false)
  const colorPair = BG_COLORS[getColorIndex(name || 'placeholder')]
  const borderRadius = roundedTop ? '10px 10px 0 0' : '8px'

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name || 'Produto'}
        onError={() => setImgError(true)}
        style={{
          width: '100%',
          height: `${height}px`,
          objectFit: 'cover',
          borderRadius,
          display: 'block',
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: '100%',
        height: `${height}px`,
        backgroundColor: colorPair.bg,
        borderRadius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ShoppingBasket size={28} style={{ color: colorPair.icon }} />
    </div>
  )
}

// ── CardápioPreview ───────────────────────────────────────────────────────────
interface CardapioPreviewProps {
  name: string
  price: string
  categoryName: string
  imageUrl: string | undefined
  primaryColor: string
}

function CardapioPreview({ name, price, categoryName, imageUrl, primaryColor }: CardapioPreviewProps) {
  const displayName = name || 'Nome do produto'
  const displayCategory = categoryName || 'Categoria'
  const displayPrice = price && !isNaN(parseFloat(price))
    ? parseFloat(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'R$ 0,00'

  return (
    <div
      style={{
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <ImageArea imageUrl={imageUrl} name={name} height={120} roundedTop />
      <div style={{ padding: '12px' }}>
        <p
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: name ? '#0F172A' : '#CBD5E1',
            margin: 0,
            marginBottom: '2px',
            lineHeight: '1.3',
          }}
        >
          {displayName}
        </p>
        <p
          style={{
            fontSize: '11px',
            color: '#94A3B8',
            margin: 0,
            marginBottom: '10px',
          }}
        >
          {displayCategory}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: primaryColor }}>
            {displayPrice}
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#FFFFFF',
              backgroundColor: primaryColor,
              padding: '4px 10px',
              borderRadius: '6px',
            }}
          >
            Adicionar
          </span>
        </div>
      </div>
    </div>
  )
}

// ── PDVPreview ────────────────────────────────────────────────────────────────
interface PDVPreviewProps {
  name: string
  price: string
  type: 'unit' | 'weight' | 'digital'
  customUnit: string | undefined
  imageUrl: string | undefined
}

function PDVPreview({ name, price, type, customUnit, imageUrl }: PDVPreviewProps) {
  const displayName = name || 'Nome do produto'
  const displayPrice = price && !isNaN(parseFloat(price))
    ? parseFloat(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'R$ 0,00'
  const unitLabel = customUnit || (type === 'weight' ? 'kg' : 'un')

  return (
    <div
      style={{
        width: '160px',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <ImageArea imageUrl={imageUrl} name={name} height={80} roundedTop />
      <div style={{ padding: '8px' }}>
        <p
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: name ? '#0F172A' : '#CBD5E1',
            margin: 0,
            marginBottom: '4px',
            lineHeight: '1.3',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {displayName}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB' }}>
            {displayPrice}
          </span>
          <span style={{ fontSize: '10px', color: '#94A3B8' }}>
            por {unitLabel}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────
function toTypeEnum(v: string): 'unit' | 'weight' | 'digital' {
  if (v === 'weight' || v === 'digital') return v
  return 'unit'
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: categories = [] } = useCategories()
  const primaryColor = useTenantStore((s) => s.primaryColor)

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
      imageUrl: '',
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
          imageUrl: product.imageUrl ?? '',
          name: product.name,
          price: String(product.price),
          categoryId: product.categoryId ?? '',
          type: toTypeEnum(product.unitType),
          stockEnabled: true,
          lowStockThreshold: '10',
          isActive: product.isActive,
          customUnit: product.customUnit ?? '',
        }
      : undefined,
  })

  const name        = watch('name')
  const price       = watch('price')
  const categoryId  = watch('categoryId')
  const type        = watch('type')
  const imageUrl    = watch('imageUrl')
  const stockEnabled = watch('stockEnabled')
  const customUnit  = watch('customUnit')

  const selectedCategory = categories.find((c) => c.id === categoryId)

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
        imageUrl: data.imageUrl || undefined,
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

        {/* Split layout */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── Left: Form ──────────────────────────────────────────────── */}
          <div
            className="flex-1 min-w-0 overflow-y-auto"
            style={{ backgroundColor: '#F8FAFC' }}
          >
            <div
              className="flex flex-col mx-auto"
              style={{ gap: '16px', padding: '20px 16px 32px', maxWidth: '672px' }}
            >

              {/* Image URL */}
              <FieldGroup label="Imagem do produto">
                <input
                  {...register('imageUrl')}
                  type="text"
                  placeholder="https://..."
                  className="border outline-none"
                  style={{
                    height: '48px',
                    padding: '0 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    borderColor: errors.imageUrl ? '#DC2626' : '#E2E8F0',
                    fontSize: '14px',
                    color: '#0F172A',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.imageUrl && (
                  <span style={{ fontSize: '12px', color: '#DC2626' }}>{errors.imageUrl.message}</span>
                )}
                {imageUrl ? (
                  <div style={{ marginTop: '4px' }}>
                    <ImageArea imageUrl={imageUrl} name={name} height={60} />
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                    Cole a URL de uma imagem (opcional)
                  </span>
                )}
              </FieldGroup>

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
                    <Toggle value={field.value} onChange={field.onChange} ariaLabel="Toggle controle de estoque" />
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
                    <Toggle value={field.value} onChange={field.onChange} ariaLabel="Toggle produto ativo" />
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

          {/* ── Right: Preview (hidden on mobile) ───────────────────────── */}
          <div
            className="hidden lg:flex lg:flex-col flex-shrink-0 overflow-y-auto"
            style={{
              width: '360px',
              backgroundColor: '#FFFFFF',
              borderLeft: '1px solid #E2E8F0',
              padding: '20px',
              position: 'sticky',
              top: 0,
              height: '100%',
              gap: '24px',
            }}
          >
            {/* Cardápio preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                No Cardápio Digital
              </span>
              <CardapioPreview
                name={name}
                price={price}
                categoryName={selectedCategory?.name ?? ''}
                imageUrl={imageUrl || undefined}
                primaryColor={primaryColor}
              />
            </div>

            {/* PDV preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                No PDV
              </span>
              <PDVPreview
                name={name}
                price={price}
                type={type}
                customUnit={customUnit}
                imageUrl={imageUrl || undefined}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
