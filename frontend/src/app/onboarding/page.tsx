'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle, ImageIcon, Link2, Loader2, Store, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useTenantStore } from '@/store/useTenantStore'
import { tenantApi } from '@/features/auth/api/tenant.api'
import { api } from '@/lib/axios'

// ─── Types ───────────────────────────────────────────────────────────────────

interface LocalCategory {
  id: string
  name: string
}

interface LocalProduct {
  id: string
  name: string
  price: number
  stock: number
  categoryId: string | null
  imageUrl: string | null
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLOR_PRESETS = [
  '#2563EB',
  '#16A34A',
  '#EA580C',
  '#9333EA',
  '#DC2626',
  '#0891B2',
]

const STEP_LABELS = [
  'Identidade',
  'Categorias',
  'Produtos',
  'Concluído',
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '6px',
            borderRadius: '9999px',
            transition: 'all 0.25s',
            flex: i === current ? '1 1 auto' : '0 0 24px',
            background: i <= current ? '#2563EB' : '#334155',
          }}
        />
      ))}
    </div>
  )
}

// ─── Step 1: Identidade da loja ──────────────────────────────────────────────

function Step1Identity({
  primaryColor,
  setPrimaryColor,
  logoUrl,
  setLogoUrl,
}: {
  primaryColor: string
  setPrimaryColor: (c: string) => void
  logoUrl: string
  setLogoUrl: (u: string) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-white mb-2">URL do logotipo</p>
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#0F172A',
              border: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Logo preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <Store size={18} color="#94A3B8" />
            )}
          </div>
          <input
            type="text"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://exemplo.com/logo.png"
            style={{
              flex: 1,
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: '8px 12px',
              color: '#FFFFFF',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-white mb-3">Cor principal</p>
        <div className="flex items-center gap-2 flex-wrap">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setPrimaryColor(color)}
              aria-label={`Cor ${color}`}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: color,
                border: primaryColor === color ? '3px solid #FFFFFF' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          ))}
          <label
            htmlFor="custom-color"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: COLOR_PRESETS.includes(primaryColor) ? '#334155' : primaryColor,
              border: !COLOR_PRESETS.includes(primaryColor) ? '3px solid #FFFFFF' : '3px solid #334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
            title="Cor personalizada"
          >
            <input
              id="custom-color"
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              style={{ opacity: 0, width: 1, height: 1, position: 'absolute' }}
            />
            <span style={{ fontSize: 12, color: '#94A3B8', userSelect: 'none' }}>+</span>
          </label>
        </div>
      </div>

      {/* Mini sidebar preview */}
      <div>
        <p className="text-sm font-medium text-white mb-3">Pré-visualização</p>
        <div
          style={{
            background: '#0F172A',
            borderRadius: 12,
            padding: 12,
            border: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            width: 160,
          }}
        >
          {['Dashboard', 'PDV', 'Produtos', 'Relatórios'].map((item, i) => (
            <div
              key={item}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: i === 0 ? 600 : 400,
                color: i === 0 ? '#FFFFFF' : '#94A3B8',
                background: i === 0 ? primaryColor : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 2: Categorias ──────────────────────────────────────────────────────

function Step2Categories({
  categories,
  setCategories,
}: {
  categories: LocalCategory[]
  setCategories: (c: LocalCategory[]) => void
}) {
  const [input, setInput] = useState('')

  function addCategory() {
    const trimmed = input.trim()
    if (!trimmed) return
    setCategories([
      ...categories,
      { id: crypto.randomUUID(), name: trimmed },
    ])
    setInput('')
  }

  function removeCategory(id: string) {
    setCategories(categories.filter((c) => c.id !== id))
  }

  return (
    <div className="flex flex-col gap-5">
      <p style={{ color: '#94A3B8', fontSize: 14 }}>
        Categorias ajudam a organizar seus produtos no PDV.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory() } }}
          placeholder="Ex: Bebidas, Lanches, Sobremesas"
          style={{
            flex: 1,
            background: '#0F172A',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: '8px 12px',
            color: '#FFFFFF',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={addCategory}
          style={{
            background: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Adicionar
        </button>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#0F172A',
                border: '1px solid #334155',
                borderRadius: 8,
                padding: '8px 12px',
              }}
            >
              <span style={{ color: '#FFFFFF', fontSize: 14 }}>{cat.name}</span>
              <button
                type="button"
                onClick={() => removeCategory(cat.id)}
                aria-label={`Remover ${cat.name}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 2,
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Step 3: Produtos ────────────────────────────────────────────────────────

function Step3Products({
  products,
  setProducts,
  categories,
}: {
  products: LocalProduct[]
  setProducts: (p: LocalProduct[]) => void
  categories: LocalCategory[]
}) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('0')
  const [categoryId, setCategoryId] = useState<string>('')
  const [imageTab, setImageTab] = useState<'url' | 'file'>('url')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return

    // Preview local imediato (base64)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string)
      setImageError(false)
    }
    reader.readAsDataURL(file)

    // Upload real para o backend
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post<{ data: { url: string } }>('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setImageUrl(res.data.data.url)
    } catch {
      setImageError(true)
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } finally {
      setIsUploading(false)
    }
  }

  function handleUrlChange(val: string) {
    setImageUrl(val)
    setImagePreview(val || null)
    setImageError(false)
  }

  function clearImage() {
    setImageUrl('')
    setImagePreview(null)
    setImageError(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function addProduct() {
    const trimmedName = name.trim()
    if (!trimmedName) return
    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice < 0) return
    setProducts([
      ...products,
      {
        id: crypto.randomUUID(),
        name: trimmedName,
        price: parsedPrice,
        stock: parseInt(stock, 10) || 0,
        categoryId: categoryId || null,
        imageUrl: imageUrl || null,
      },
    ])
    setName('')
    setPrice('')
    setStock('0')
    setCategoryId('')
    clearImage()
  }

  function removeProduct(id: string) {
    setProducts(products.filter((p) => p.id !== id))
  }

  const inputStyle: React.CSSProperties = {
    background: '#0F172A',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '8px 12px',
    color: '#FFFFFF',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '6px 0',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    color: active ? '#FFFFFF' : '#94A3B8',
    background: active ? '#2563EB' : 'transparent',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    transition: 'all 0.15s',
  })

  return (
    <div className="flex flex-col gap-5">
      <p style={{ color: '#94A3B8', fontSize: 14 }}>
        Adicione produtos e defina o estoque inicial de cada um.
      </p>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addProduct() } }}
          placeholder="Nome do produto"
          style={inputStyle}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="flex flex-col gap-1">
            <label style={{ color: '#94A3B8', fontSize: 12 }}>Preço (R$)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0,00"
              min={0}
              step={0.01}
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ color: '#94A3B8', fontSize: 12 }}>Estoque inicial</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              min={0}
              style={inputStyle}
            />
          </div>
        </div>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        >
          <option value="">Sem categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Image section */}
        <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: 12 }}>
          <p style={{ color: '#94A3B8', fontSize: 12, marginBottom: 8 }}>Imagem do produto (opcional)</p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: '#1E293B', borderRadius: 8, padding: 3, marginBottom: 10 }}>
            <button type="button" style={tabBtnStyle(imageTab === 'url')} onClick={() => setImageTab('url')}>
              <Link2 size={13} aria-hidden /> URL
            </button>
            <button type="button" style={tabBtnStyle(imageTab === 'file')} onClick={() => setImageTab('file')}>
              <Upload size={13} aria-hidden /> Computador
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            {/* Preview thumbnail */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: '#1E293B',
                border: '1px solid #334155',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {imagePreview && !imageError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setImageError(true)}
                />
              ) : (
                <ImageIcon size={20} color="#475569" aria-hidden />
              )}
            </div>

            {/* Input area */}
            <div style={{ flex: 1 }}>
              {imageTab === 'url' ? (
                <input
                  type="text"
                  value={imageUrl.startsWith('data:') ? '' : imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://exemplo.com/imagem.png"
                  style={{ ...inputStyle, padding: '6px 10px', fontSize: 13 }}
                />
              ) : (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="product-image-file"
                  />
                  <label
                    htmlFor="product-image-file"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#1E293B',
                      border: '1px dashed #334155',
                      borderRadius: 8,
                      padding: '6px 10px',
                      color: '#94A3B8',
                      fontSize: 13,
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      userSelect: 'none',
                      opacity: isUploading ? 0.7 : 1,
                    }}
                  >
                    {isUploading
                      ? <><Loader2 size={13} className="animate-spin" aria-hidden /> Enviando...</>
                      : imageUrl && !imageUrl.startsWith('data:')
                        ? <><Upload size={13} aria-hidden /> Imagem enviada ✓</>
                        : <><Upload size={13} aria-hidden /> Escolher arquivo...</>
                    }
                  </label>
                </>
              )}
              {imageError && (
                <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>URL inválida ou imagem não carregou</p>
              )}
            </div>

            {/* Clear button */}
            {imageUrl && (
              <button
                type="button"
                onClick={clearImage}
                aria-label="Remover imagem"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4, flexShrink: 0 }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={addProduct}
          disabled={isUploading}
          style={{
            background: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 600,
            cursor: isUploading ? 'not-allowed' : 'pointer',
            opacity: isUploading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            justifyContent: 'center',
          }}
        >
          {isUploading ? <><Loader2 size={14} className="animate-spin" aria-hidden /> Enviando imagem...</> : 'Adicionar produto'}
        </button>
      </div>

      {products.length > 0 && (
        <div className="flex flex-col gap-2">
          {products.map((prod) => (
            <div
              key={prod.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#0F172A',
                border: '1px solid #334155',
                borderRadius: 8,
                padding: '8px 12px',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                {/* Thumbnail na lista */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: '#1E293B',
                    flexShrink: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {prod.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  ) : (
                    <ImageIcon size={14} color="#475569" aria-hidden />
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <span style={{ color: '#FFFFFF', fontSize: 14, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {prod.name}
                  </span>
                  <span style={{ color: '#94A3B8', fontSize: 12 }}>
                    R$ {prod.price.toFixed(2)} · estoque: {prod.stock}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeProduct(prod.id)}
                aria-label={`Remover ${prod.name}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', padding: 2, flexShrink: 0 }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Step 4: Concluído ───────────────────────────────────────────────────────

function Step4Done({
  categoryCount,
  productCount,
  onFinish,
  isFinishing,
}: {
  categoryCount: number
  productCount: number
  onFinish: () => void
  isFinishing: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <CheckCircle size={64} color="#16A34A" strokeWidth={1.5} />
      <div>
        <h2 style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          Tudo pronto!
        </h2>
        <p style={{ color: '#94A3B8', fontSize: 15 }}>
          Sua loja está configurada e pronta para receber pedidos.
        </p>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 12,
          color: '#94A3B8',
          fontSize: 14,
          background: '#0F172A',
          borderRadius: 8,
          padding: '10px 20px',
          border: '1px solid #334155',
        }}
      >
        <span>{categoryCount} {categoryCount === 1 ? 'categoria' : 'categorias'}</span>
        <span style={{ color: '#334155' }}>•</span>
        <span>{productCount} {productCount === 1 ? 'produto adicionado' : 'produtos adicionados'}</span>
      </div>
      <button
        type="button"
        onClick={onFinish}
        disabled={isFinishing}
        style={{
          background: '#2563EB',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 10,
          padding: '12px 32px',
          fontSize: 15,
          fontWeight: 600,
          cursor: isFinishing ? 'not-allowed' : 'pointer',
          opacity: isFinishing ? 0.7 : 1,
          width: '100%',
          transition: 'opacity 0.15s',
        }}
      >
        {isFinishing ? 'Salvando...' : 'Acessar o painel'}
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, _hasHydrated } = useAuthStore()
  const { onboardingCompleted } = useTenantStore()

  // Auth guard — wait for hydration
  useEffect(() => {
    if (!_hasHydrated) return
    if (!user || user.role !== 'store_owner') {
      router.replace('/login')
      return
    }
    if (onboardingCompleted) {
      router.replace('/dashboard')
    }
  }, [_hasHydrated, user, onboardingCompleted, router])

  // Step state
  const [step, setStep] = useState(0)

  // Step 1 state
  const [primaryColor, setPrimaryColor] = useState('#2563EB')
  const [logoUrl, setLogoUrl] = useState('')

  // Step 2 state
  const [categories, setCategories] = useState<LocalCategory[]>([])

  // Step 3 state
  const [products, setProducts] = useState<LocalProduct[]>([])

  // Step 4 state
  const [isFinishing, setIsFinishing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Map of localCategory id → api id (needed to link products)
  const [categoryIdMap, setCategoryIdMap] = useState<Map<string, string>>(new Map())

  // Initialise color from tenant store on mount
  useEffect(() => {
    const stored = useTenantStore.getState()
    if (stored.primaryColor) setPrimaryColor(stored.primaryColor)
    if (stored.logoUrl) setLogoUrl(stored.logoUrl ?? '')
  }, [])

  if (!_hasHydrated || !user) return null

  function handleStep1Next() {
    // Non-blocking save
    tenantApi.updateMySettings({ primaryColor, logoUrl: logoUrl || undefined }).catch(() => {})
    useTenantStore.getState().setTenantSettings({ primaryColor, logoUrl: logoUrl || undefined })
    setStep(1)
  }

  async function handleStep2Next() {
    if (categories.length === 0) {
      setStep(2)
      return
    }
    setIsSaving(true)
    const idMap = new Map<string, string>()
    await Promise.allSettled(
      categories.map(async (cat) => {
        try {
          const res = await api.post<{ data: { id: string } }>('/categories', { name: cat.name })
          idMap.set(cat.id, res.data.data.id)
        } catch (err: unknown) {
          const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string }
          console.error('[onboarding] Categoria falhou:', e?.response?.data ?? e?.message)
        }
      }),
    )
    setCategoryIdMap(idMap)
    setIsSaving(false)
    setStep(2)
  }

  async function handleStep3Next() {
    if (products.length === 0) {
      setStep(3)
      return
    }
    setIsSaving(true)
    console.log('[onboarding] Criando produtos:', products.length)
    const results = await Promise.allSettled(
      products.map((prod) => {
        const body = {
          name: prod.name,
          price: prod.price,
          unitType: 'unit',
          initialStock: prod.stock,
          categoryId: prod.categoryId ? (categoryIdMap.get(prod.categoryId) ?? undefined) : undefined,
          ...(prod.imageUrl ? { imageUrl: prod.imageUrl } : {}),
        }
        console.log('[onboarding] POST /products:', body)
        return api.post('/products', body)
      }),
    )
    const successes = results.filter((r) => r.status === 'fulfilled').length
    console.log('[onboarding] Produtos criados com sucesso:', successes, '/', products.length)
    const failures = results.filter((r) => r.status === 'rejected')
    if (failures.length > 0) {
      failures.forEach((f, i) => {
        const err = (f as PromiseRejectedResult).reason
        const msg = err?.response?.data?.error?.message ?? err?.message ?? 'Erro desconhecido'
        console.error(`[onboarding] Produto ${i + 1} falhou:`, msg, err?.response?.data)
      })
      const firstMsg = (failures[0] as PromiseRejectedResult).reason?.response?.data?.error?.message
      toast.error(firstMsg ?? `${failures.length} produto(s) não puderam ser salvos. Tente novamente.`)
    }
    setIsSaving(false)
    setStep(3)
  }

  async function handleFinish() {
    setIsFinishing(true)
    try {
      await tenantApi.updateMySettings({ onboardingCompleted: true })
      useTenantStore.getState().setTenantSettings({ onboardingCompleted: true })
    } catch {
      useTenantStore.getState().setTenantSettings({ onboardingCompleted: true })
    } finally {
      setIsFinishing(false)
    }
    await queryClient.invalidateQueries({ queryKey: ['products'] })
    await queryClient.invalidateQueries({ queryKey: ['stock'] })
    router.push('/dashboard')
  }

  const navBtnBase: React.CSSProperties = {
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    border: 'none',
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 512,
          background: '#1E293B',
          borderRadius: 16,
          padding: '32px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Step indicator */}
        <div style={{ marginBottom: 24 }}>
          <StepIndicator current={step} total={STEP_LABELS.length} />
          <p style={{ color: '#94A3B8', fontSize: 12, marginTop: 6 }}>
            Passo {step + 1} de {STEP_LABELS.length} — {STEP_LABELS[step]}
          </p>
        </div>

        {/* Step title */}
        <h1
          style={{
            color: '#FFFFFF',
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          {step === 0 && 'Identidade da loja'}
          {step === 1 && 'Adicione suas categorias de produto'}
          {step === 2 && 'Adicione seus primeiros produtos'}
          {step === 3 && 'Tudo pronto!'}
        </h1>

        {/* Step content */}
        <div style={{ marginBottom: 28 }}>
          {step === 0 && (
            <Step1Identity
              primaryColor={primaryColor}
              setPrimaryColor={setPrimaryColor}
              logoUrl={logoUrl}
              setLogoUrl={setLogoUrl}
            />
          )}
          {step === 1 && (
            <Step2Categories categories={categories} setCategories={setCategories} />
          )}
          {step === 2 && (
            <Step3Products
              products={products}
              setProducts={setProducts}
              categories={categories}
            />
          )}
          {step === 3 && (
            <Step4Done
              categoryCount={categories.length}
              productCount={products.length}
              onFinish={handleFinish}
              isFinishing={isFinishing}
            />
          )}
        </div>

        {/* Navigation buttons — hidden on final step */}
        {step < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  style={{
                    ...navBtnBase,
                    background: 'transparent',
                    border: '1px solid #334155',
                    color: '#94A3B8',
                  }}
                >
                  Voltar
                </button>
              )}
              {step >= 1 && (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    if (step === 1) handleStep2Next()
                    else if (step === 2) handleStep3Next()
                  }}
                  style={{
                    ...navBtnBase,
                    background: 'none',
                    color: '#94A3B8',
                    padding: '10px 0',
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                    opacity: isSaving ? 0.5 : 1,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  Pular esta etapa
                </button>
              )}
            </div>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                if (step === 0) handleStep1Next()
                else if (step === 1) handleStep2Next()
                else if (step === 2) handleStep3Next()
              }}
              style={{
                ...navBtnBase,
                background: '#2563EB',
                color: '#FFFFFF',
                opacity: isSaving ? 0.7 : 1,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} className="animate-spin" aria-hidden />
                  Salvando...
                </>
              ) : (
                step === 2 ? 'Finalizar' : 'Próximo'
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
