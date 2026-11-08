'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { CheckoutButton } from './checkout-button'

const ExpressUnlock = dynamic(() => import('@/components/express-unlock'), { ssr: false })

export function BillingContent({
  price,
  expressEnabled,
}: {
  price: string
  expressEnabled: boolean
}) {
  const t = useTranslations('billing')
  // null = still finding out whether this device has a wallet
  const [walletsAvailable, setWalletsAvailable] = useState<boolean | null>(null)

  const features = [
    t('feature1'),
    t('feature2'),
    t('feature3'),
    t('feature4'),
  ]

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <div className="rounded-3xl border border-border bg-card p-8">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">
          {t('badge')}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          {t('heading')}
        </h1>
        <p className="mt-3 text-muted">{t('desc')}</p>

        <div className="my-8 text-center">
          <span className="font-display text-6xl font-semibold tracking-tight">
            {price}
          </span>
          <p className="mt-1 text-sm text-muted">{t('priceSub')}</p>
        </div>

        <ul className="mb-8 space-y-3 text-sm">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <span className="text-confident">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {expressEnabled && <ExpressUnlock onAvailabilityChange={setWalletsAvailable} />}

        {walletsAvailable && (
          <p className="my-4 text-center text-xs uppercase tracking-[0.18em] text-muted">
            {t('orPayWithCard')}
          </p>
        )}

        <CheckoutButton price={price} variant={walletsAvailable ? 'secondary' : 'primary'} />
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        {t('alreadyUnlocked')}{' '}
        <Link href="/dashboard" className="underline hover:text-foreground">
          {t('goToDashboard')}
        </Link>
      </p>
    </div>
  )
}
