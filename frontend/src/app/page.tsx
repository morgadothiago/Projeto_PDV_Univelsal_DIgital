import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'PDV Universal — Sistema de Ponto de Venda para Pequenos Negócios',
  description:
    'Sistema completo de PDV para mercados, padarias, restaurantes e lanchonetes. Controle vendas, estoque e relatórios em tempo real. Comece grátis.',
  keywords: [
    'pdv',
    'ponto de venda',
    'sistema pdv',
    'caixa',
    'mercado',
    'padaria',
    'restaurante',
    'estoque',
  ],
  openGraph: {
    title: 'PDV Universal — Sistema de Ponto de Venda',
    description:
      'Sistema completo de PDV para pequenos negócios brasileiros. Grátis para começar.',
    type: 'website',
  },
}

const features = [
  {
    icon: '🛒',
    title: 'PDV Ultrarrápido',
    description:
      'Registre vendas em segundos. Interface otimizada para velocidade no caixa, com busca instantânea de produtos.',
  },
  {
    icon: '📦',
    title: 'Controle de Estoque',
    description:
      'Acompanhe entradas e saídas em tempo real. Receba alertas quando o estoque estiver baixo.',
  },
  {
    icon: '📊',
    title: 'Relatórios em Tempo Real',
    description:
      'Visualize o faturamento do dia, semana e mês. Tome decisões com dados atualizados.',
  },
  {
    icon: '👥',
    title: 'Multi-caixeiro',
    description:
      'Cada funcionário com seu próprio acesso. Controle quem pode fazer o quê no sistema.',
  },
  {
    icon: '🏪',
    title: 'Multi-loja',
    description:
      'Gerencie múltiplas unidades do mesmo painel. Dados separados por loja, visão consolidada.',
  },
  {
    icon: '📱',
    title: 'Funciona no Celular',
    description:
      'Acesse do celular, tablet ou computador. Interface responsiva para qualquer dispositivo.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <span className="text-slate-900 font-semibold text-lg">PDV Universal</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#funcionalidades"
              className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              Funcionalidades
            </a>
            <a
              href="#planos"
              className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              Planos
            </a>
            <Link
              href="/login"
              className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              Entrar
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:block text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/cadastrar"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Começar grátis
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-slate-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <span className="text-blue-400 text-sm font-medium">
                Sistema de PDV para pequenos negócios
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              O caixa mais rápido
              <span className="block text-blue-400">do seu negócio</span>
            </h1>

            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Vendas, estoque e relatórios em um só lugar. Feito para mercados, padarias,
              restaurantes e lanchonetes brasileiras.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/cadastrar"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors text-base"
              >
                Começar grátis
              </Link>
              <a
                href="#funcionalidades"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors text-base border border-white/10"
              >
                Ver demonstração
              </a>
            </div>

            <p className="text-slate-500 text-sm mt-6">
              Sem cartão de crédito. Configure em menos de 5 minutos.
            </p>
          </div>

          {/* Mock dashboard illustration */}
          <div className="mt-16 md:mt-20 relative">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-slate-700 rounded px-3 py-1 text-slate-400 text-xs text-center max-w-xs mx-auto">
                    pdvuniversal.app/pdv
                  </div>
                </div>
              </div>

              {/* Mock PDV UI */}
              <div className="grid grid-cols-3 gap-0 min-h-[280px] md:min-h-[360px]">
                {/* Product grid */}
                <div className="col-span-2 p-4 md:p-6 bg-slate-900">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 bg-slate-800 rounded-lg px-3 py-2 text-slate-500 text-sm">
                      Buscar produto...
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { name: 'Pão Francês', price: 'R$ 0,75' },
                      { name: 'Café 500g', price: 'R$ 12,90' },
                      { name: 'Leite 1L', price: 'R$ 6,50' },
                      { name: 'Açúcar 1kg', price: 'R$ 4,80' },
                      { name: 'Arroz 5kg', price: 'R$ 28,00' },
                      { name: 'Feijão 1kg', price: 'R$ 9,90' },
                    ].map((p) => (
                      <div
                        key={p.name}
                        className="bg-slate-800 border border-slate-700 rounded-lg p-3 cursor-pointer hover:border-blue-500/50 transition-colors"
                      >
                        <div className="w-full h-8 bg-slate-700 rounded mb-2"></div>
                        <p className="text-white text-xs font-medium truncate">{p.name}</p>
                        <p className="text-blue-400 text-xs mt-0.5">{p.price}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cart panel */}
                <div className="col-span-1 bg-slate-800 border-l border-slate-700 p-4 flex flex-col">
                  <p className="text-slate-400 text-xs font-medium mb-3 uppercase tracking-wide">
                    Carrinho
                  </p>
                  <div className="flex-1 space-y-2">
                    {[
                      { name: 'Pão Francês', qty: 3, total: 'R$ 2,25' },
                      { name: 'Café 500g', qty: 1, total: 'R$ 12,90' },
                    ].map((item) => (
                      <div key={item.name} className="text-xs">
                        <p className="text-white truncate">{item.name}</p>
                        <div className="flex justify-between text-slate-400 mt-0.5">
                          <span>x{item.qty}</span>
                          <span>{item.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-700 pt-3 mt-3">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-400">Total</span>
                      <span className="text-white font-bold">R$ 15,15</span>
                    </div>
                    <div className="bg-blue-600 rounded-lg py-2 text-center text-white text-xs font-medium">
                      Finalizar
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-blue-600/5 rounded-2xl pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tudo que seu negócio precisa
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Do caixa ao estoque, do relatório ao controle de acesso. Uma plataforma completa para
              você focar no que importa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-slate-900 font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-slate-100"></div>

      {/* Pricing */}
      <section id="planos" className="py-20 md:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Planos simples e transparentes
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Comece grátis e escale conforme seu negócio cresce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free plan */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8">
              <div className="mb-6">
                <h3 className="text-slate-900 font-bold text-xl mb-1">Grátis</h3>
                <p className="text-slate-500 text-sm">Para quem está começando</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold text-slate-900">R$ 0</span>
                <span className="text-slate-500 text-sm">/mês</span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Até 50 produtos',
                  '1 caixeiro',
                  'Relatórios básicos',
                  'PDV completo',
                  'Suporte por e-mail',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/cadastrar"
                className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Começar grátis
              </Link>
            </div>

            {/* Pro plan */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Em breve
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-1">Pro</h3>
                <p className="text-slate-400 text-sm">Para negócios em crescimento</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold text-white">Em breve</span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Produtos ilimitados',
                  'Múltiplos caixeiros',
                  'Relatórios avançados',
                  'Multi-loja',
                  'Suporte prioritário',
                  'Exportação de dados',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-5 h-5 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <button
                disabled
                className="block w-full text-center bg-blue-600/40 text-blue-300 font-semibold py-3 rounded-lg cursor-not-allowed"
              >
                Em breve
              </button>

              {/* Background accent */}
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full -mb-20 -mr-20 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Pronto para começar?
          </h2>
          <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-xl mx-auto">
            Junte-se a centenas de negócios que já usam o PDV Universal. Configuração em menos de 5
            minutos, sem cartão de crédito.
          </p>
          <Link
            href="/cadastrar"
            className="inline-block bg-white text-blue-600 hover:bg-blue-50 font-bold px-10 py-4 rounded-xl transition-colors text-lg shadow-lg"
          >
            Criar conta grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <span className="text-slate-300 font-medium">PDV Universal</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#funcionalidades" className="hover:text-slate-300 transition-colors">
                Funcionalidades
              </a>
              <a href="#planos" className="hover:text-slate-300 transition-colors">
                Planos
              </a>
              <Link href="/login" className="hover:text-slate-300 transition-colors">
                Entrar
              </Link>
            </div>

            <p className="text-slate-600 text-sm">
              &copy; 2026 PDV Universal. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
