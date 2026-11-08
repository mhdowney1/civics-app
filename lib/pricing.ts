// Shared (client + server) pricing config for the price test.
// The PostHog multivariate flag `price_test` returns one of these variant keys.
// The server maps the variant to a Stripe price via its lookup_key; the client
// only uses the cents value for display. Never trust a price sent by the client.

export const PRICE_TEST_FLAG = 'price_test'

export const PRICE_VARIANTS = {
  '999': { lookupKey: 'full_access_999', cents: 999 },
  '1299': { lookupKey: 'full_access_1299', cents: 1299 },
  '1499': { lookupKey: 'full_access_1499', cents: 1499 },
  '1999': { lookupKey: 'full_access_1999', cents: 1999 },
  '2999': { lookupKey: 'full_access_2999', cents: 2999 },
} as const

export type PriceVariant = keyof typeof PRICE_VARIANTS

// Used when the flag is off, missing, or returns an unknown variant.
// Matches the price before the test started.
export const DEFAULT_PRICE_VARIANT: PriceVariant = '1299'

export function toPriceVariant(value: unknown): PriceVariant {
  return typeof value === 'string' && value in PRICE_VARIANTS
    ? (value as PriceVariant)
    : DEFAULT_PRICE_VARIANT
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}
