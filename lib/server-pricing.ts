import 'server-only'
import { getPostHogClient } from '@/lib/posthog-server'
import { getStripe } from '@/lib/stripe'
import {
  PRICE_TEST_FLAG,
  PRICE_VARIANTS,
  DEFAULT_PRICE_VARIANT,
  toPriceVariant,
  type PriceVariant,
} from '@/lib/pricing'

export type ResolvedPrice = {
  variant: PriceVariant
  priceId: string
  cents: number
}

// Which price-test variant this user is in. Falls back to the default when
// PostHog is unreachable or the flag is off, so checkout never breaks.
export async function getPriceVariant(distinctId: string): Promise<PriceVariant> {
  try {
    const value = await getPostHogClient().getFeatureFlag(PRICE_TEST_FLAG, distinctId)
    return toPriceVariant(value)
  } catch {
    return DEFAULT_PRICE_VARIANT
  }
}

// Short in-memory cache so we don't hit the Stripe Prices API on every page view.
const priceCache = new Map<string, { value: ResolvedPrice; expires: number }>()
const CACHE_MS = 5 * 60 * 1000

async function lookupPrice(variant: PriceVariant): Promise<ResolvedPrice | null> {
  const cached = priceCache.get(variant)
  if (cached && cached.expires > Date.now()) return cached.value

  const { lookupKey } = PRICE_VARIANTS[variant]
  const prices = await getStripe().prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  })
  const price = prices.data[0]
  if (!price || price.unit_amount == null) return null

  const value = { variant, priceId: price.id, cents: price.unit_amount }
  priceCache.set(variant, { value, expires: Date.now() + CACHE_MS })
  return value
}

// Resolves the Stripe price for a user. Order of preference:
// 1. their price-test variant's lookup_key
// 2. the default variant's lookup_key
// 3. the legacy STRIPE_PRICE_ID env var (until lookup-key prices exist in every environment)
export async function resolvePriceForUser(distinctId: string): Promise<ResolvedPrice> {
  const variant = await getPriceVariant(distinctId)

  const fromVariant = await lookupPrice(variant)
  if (fromVariant) return fromVariant

  if (variant !== DEFAULT_PRICE_VARIANT) {
    const fromDefault = await lookupPrice(DEFAULT_PRICE_VARIANT)
    if (fromDefault) return fromDefault
  }

  const legacyId = process.env.STRIPE_PRICE_ID
  if (legacyId) {
    const price = await getStripe().prices.retrieve(legacyId)
    if (price.unit_amount != null) {
      return { variant: DEFAULT_PRICE_VARIANT, priceId: price.id, cents: price.unit_amount }
    }
  }

  throw new Error('No Stripe price configured (lookup keys or STRIPE_PRICE_ID)')
}
