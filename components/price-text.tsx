'use client'

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'
import { useTranslations } from 'next-intl'
import {
  PRICE_TEST_FLAG,
  PRICE_VARIANTS,
  DEFAULT_PRICE_VARIANT,
  toPriceVariant,
  formatPrice,
} from '@/lib/pricing'

// The visitor's price-test price for display on public pages. Uses the same
// PostHog flag as checkout, so the landing page and /billing agree.
// (Enable "persist flag across authentication steps" on `price_test` in
// PostHog so the variant survives sign-up.)
export function usePriceTestPrice(): string {
  const [cents, setCents] = useState<number>(PRICE_VARIANTS[DEFAULT_PRICE_VARIANT].cents)

  useEffect(() => {
    if (!posthog.__loaded) return
    return posthog.onFeatureFlags(() => {
      const variant = toPriceVariant(posthog.getFeatureFlag(PRICE_TEST_FLAG))
      setCents(PRICE_VARIANTS[variant].cents)
    })
  }, [])

  return formatPrice(cents)
}

type LandingPriceKey = 'pricing.paid.price' | 'pricing.footnote' | 'cta.sub'

export function LandingPriceText({ messageKey }: { messageKey: LandingPriceKey }) {
  const t = useTranslations('landing')
  const price = usePriceTestPrice()
  return <>{t(messageKey, { price })}</>
}
