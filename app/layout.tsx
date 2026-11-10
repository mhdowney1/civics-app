import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { cookies } from 'next/headers'
import { ClerkProvider } from '@clerk/nextjs'
import { NextIntlClientProvider } from 'next-intl'
import { PostHogProvider } from '@/components/posthog-provider'
import { OfflineSync } from '@/components/offline-sync'
import { ServiceWorkerRegister } from '@/components/sw-register'
import { organizationJsonLd, jsonLdScript } from '@/lib/structured-data'
import './globals.css'

// Fonts are committed in app/fonts (latin subset, from @fontsource) rather than
// fetched from Google at build time: that fetch fails intermittently on Vercel
// and was breaking deploys.
const syne = localFont({
  variable: '--font-syne',
  src: [
    { path: './fonts/syne-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/syne-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/syne-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './fonts/syne-latin-800-normal.woff2', weight: '800', style: 'normal' },
  ],
  display: 'swap',
})

const dmSans = localFont({
  variable: '--font-dm-sans',
  src: [
    { path: './fonts/dm-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/dm-sans-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/dm-sans-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/dm-sans-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://civicsstudy.com'),
  title: 'Civics Study — 2026 Citizenship Test Prep',
  description:
    'The oral-format practice tool for the 128-question 2025 USCIS civics test. Answer out loud, take mock interviews, track progress. Free to start.',
  applicationName: 'Civics Study',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Civics Study — 2026 Citizenship Test Prep',
    description:
      'The oral-format practice tool for the 128-question 2025 USCIS civics test. Answer out loud, take mock interviews, track progress. Free to start.',
    type: 'website',
    url: 'https://civicsstudy.com',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Civics Study — Citizenship Test Prep' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Civics Study — 2026 Citizenship Test Prep',
    description:
      'The oral-format practice tool for the 128-question 2025 USCIS civics test. Answer out loud, take mock interviews, track progress. Free to start.',
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={jsonLdScript(organizationJsonLd)}
          />
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
