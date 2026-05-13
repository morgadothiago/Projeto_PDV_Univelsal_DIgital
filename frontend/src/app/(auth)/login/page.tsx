import { ShoppingCart, Zap, BarChart3, Shield } from 'lucide-react'
import { LoginForm } from '@/features/auth/components/LoginForm'

const features = [
  {
    icon: Zap,
    title: 'Vendas ultrarrápidas',
    description: 'Processe pedidos em segundos com nossa interface otimizada para velocidade.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios em tempo real',
    description: 'Acompanhe suas vendas, estoque e lucros ao vivo, a qualquer momento.',
  },
  {
    icon: Shield,
    title: 'Segurança e confiança',
    description: 'Dados protegidos com criptografia de ponta e controle de acesso por perfil.',
  },
]

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-[#F8FAFC]">
      {/* ── LEFT PANEL (desktop only) ── */}
      <aside className="hidden md:flex md:w-[720px] flex-col justify-between bg-[#0F172A] p-16">
        {/* Logo + headline */}
        <div className="flex flex-col gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2563EB]">
            <ShoppingCart size={32} color="#FFFFFF" aria-hidden />
          </div>
          <h1 className="text-[32px] font-bold leading-tight text-white">PDV Universal</h1>
          <p className="text-base text-[#94A3B8]">A solução completa para seu negócio</p>
        </div>

        {/* Feature list */}
        <ul className="flex flex-col gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[#1E293B]">
                <Icon size={20} color="#94A3B8" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-0.5 text-sm text-[#94A3B8]">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <section className="flex flex-1 flex-col items-center justify-center px-8 pb-12 md:px-20">
        {/* Mobile logo (hidden on desktop) */}
        <div className="mb-8 flex flex-col items-center gap-2 md:hidden">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2563EB]">
            <ShoppingCart size={32} color="#FFFFFF" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">PDV Universal</h1>
          <p className="text-[13px] text-[#64748B]">Sistema de Ponto de Venda</p>
        </div>

        {/* Card (desktop) / plain box (mobile) */}
        <div className="w-full max-w-[400px] md:rounded-2xl md:bg-white md:p-10 md:shadow-lg">
          {/* Desktop heading */}
          <div className="mb-8 hidden md:block">
            <h2 className="text-2xl font-bold text-[#0F172A]">Bem-vindo de volta</h2>
            <p className="mt-1 text-sm text-[#64748B]">Entre com suas credenciais para continuar</p>
          </div>

          <LoginForm />

          {/* Divider (mobile only) */}
          <div className="mt-8 flex items-center gap-3 md:hidden">
            <div className="h-px flex-1 bg-[#E2E8F0]" />
            <span className="text-xs text-[#94A3B8]">ou</span>
            <div className="h-px flex-1 bg-[#E2E8F0]" />
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-[#94A3B8] md:mt-6">
            <span className="hidden md:inline">PDV Universal &copy; 2026 &mdash; Todos os direitos reservados</span>
            <span className="md:hidden">PDV Universal &copy; 2026</span>
          </p>
        </div>
      </section>
    </main>
  )
}
