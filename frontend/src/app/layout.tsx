import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from '@/components/shared/Providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'PDV Universal — Sistema de Ponto de Venda',
    template: '%s | PDV Universal',
  },
  description:
    'Sistema completo de PDV para seu negócio. Controle vendas, estoque e relatórios em tempo real.',
  applicationName: 'PDV Universal',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PDV Universal',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
