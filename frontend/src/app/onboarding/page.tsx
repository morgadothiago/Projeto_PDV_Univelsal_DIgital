'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Store, X } from 'lucide-react'
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
      },
    ])
    setName('')
    setPrice('')
    setStock('0')
    setCategoryId('')
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

  return (
    <div className="flex flex-col gap-5">
      <p style={{ color: '#94A3B8', fontSize: 14 }}>
        Adicione produtos para começar a vender imediatamente.
      </p>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do produto"
          style={inputStyle}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Preço (R$)"
            min={0}
            step={0.01}
            style={inputStyle}
          />
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Estoque"
            min={0}
            style={inputStyle}
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={{
            ...inputStyle,
            appearance: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">Sem categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addProduct}
          style={{
            background: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Adicionar produto
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
              }}
            >
              <div>
                <span style={{ color: '#FFFFFF', fontSize: 14 }}>{prod.name}</span>
                <span style={{ color: '#94A3B8', fontSize: 12, marginLeft: 8 }}>
                  R$ {prod.price.toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeProduct(prod.id)}
                aria-label={`Remover ${prod.name}`}
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

  function handleStep2Next() {
    // Fire-and-forget each category
    categories.forEach((cat) => {
      api.post('/categories', { name: cat.name }).catch(() => {})
    })
    setStep(2)
  }

  function handleStep3Next() {
    // Fire-and-forget each product
    products.forEach((prod) => {
      api
        .post('/products', {
          name: prod.name,
          price: prod.price,
          stock: prod.stock,
          categoryId: prod.categoryId ?? null,
        })
        .catch(() => {})
    })
    setStep(3)
  }

  async function handleFinish() {
    setIsFinishing(true)
    try {
      await tenantApi.updateMySettings({ onboardingCompleted: true })
      useTenantStore.getState().setTenantSettings({ onboardingCompleted: true })
      router.push('/dashboard')
    } catch {
      // Even on error, proceed to dashboard
      useTenantStore.getState().setTenantSettings({ onboardingCompleted: true })
      router.push('/dashboard')
    } finally {
      setIsFinishing(false)
    }
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
                  }}
                >
                  Pular esta etapa
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (step === 0) handleStep1Next()
                else if (step === 1) handleStep2Next()
                else if (step === 2) handleStep3Next()
              }}
              style={{
                ...navBtnBase,
                background: '#2563EB',
                color: '#FFFFFF',
              }}
            >
              {step === 2 ? 'Finalizar' : 'Próximo'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
