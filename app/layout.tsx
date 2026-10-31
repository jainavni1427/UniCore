import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AppStateProvider } from '@/components/app-state'
import { SiteHeader } from '@/components/shell/site-header'
import { CustodyBanner } from '@/components/shell/custody-banner'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'UniCore — Shared Scientific Instrument Exchange',
  description:
    'Institutional-grade, cross-university platform for discovering, booking and governing shared scientific instruments with verified credentials and tamper-evident custody.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#130b13',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${inter.variable} bg-background`}>
      <body className="min-h-dvh font-sans">
        <AppStateProvider>
          <SiteHeader />
          <CustodyBanner />
          <main className="mx-auto w-full max-w-[1440px] px-4 py-6 lg:px-6 lg:py-8">{children}</main>
          <Toaster theme="dark" position="bottom-right" richColors />
        </AppStateProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
