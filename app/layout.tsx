import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import { cookies } from 'next/headers'
import { ClerkProvider } from '@clerk/nextjs'
import { NextIntlClientProvider } from 'next-intl'
import { PostHogProvider } from '@/components/posthog-provider'
import { OfflineSync } from '@/components/offline-sync'
import { ServiceWorkerRegister } from '@/components/sw-register'
import './globals.css'

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://civicsstudy.com'),
  title: 'Civics Study — 2026 Citizenship Test Prep',
  description:
    'Calm, oral-style practice for the USCIS civics test. 128 official questions, mock tests, and progress tracking. Free to use.',
  applicationName: 'Civics Study',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Civics Study — 2026 Citizenship Test Prep',
    description:
      'Calm, oral-style practice for the USCIS civics test. 128 official questions, mock tests, and progress tracking. Free to use.',
    type: 'website',
    url: 'https://civicsstudy.com',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Civics Study — Citizenship Test Prep' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Civics Study — 2026 Citizenship Test Prep',
    description:
      'Calm, oral-style practice for the USCIS civics test. 128 official questions, mock tests, and progress tracking. Free to use.',
    images: ['/opengraph-image'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Civics Study',
    startupImage: ['/icons/apple-icon-180.png'],
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-icon-180.png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#0f0f0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies()
  const isLight = cookieStore.get('civics:theme')?.value === 'light'
  const fontSizeCookie = cookieStore.get('civics:font-size')?.value
  const fontSizeClass = fontSizeCookie === 'larger' ? ' font-larger' : fontSizeCookie === 'large' ? ' font-large' : ''

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#4ade80',
          colorBackground: '#1a1a1a',
          colorText: '#ffffff',
          colorInputBackground: '#0f0f0f',
          colorInputText: '#ffffff',
          colorTextSecondary: '#888888',
        },
        elements: {
          card: 'bg-card border border-border shadow-2xl',
          formButtonPrimary:
            'bg-confident text-black hover:opacity-90 font-semibold',
          headerTitle: 'text-foreground',
          headerSubtitle: 'text-muted',
        },
      }}
    >
      <html
        lang="en"
        className={`${syne.variable} ${dmSans.variable} h-full antialiased${isLight ? ' light' : ''}${fontSizeClass}`}
        suppressHydrationWarning
      >
        <body className="min-h-full bg-background text-foreground">
          <NextIntlClientProvider>
            <PostHogProvider>
              <OfflineSync />
              <ServiceWorkerRegister />
              {children}
            </PostHogProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
