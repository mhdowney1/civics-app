import { NextIntlClientProvider } from 'next-intl'
import { TopNav } from '@/components/top-nav'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider>
      <div className="flex min-h-screen flex-col">
        <TopNav />
        {children}
      </div>
    </NextIntlClientProvider>
  )
}
