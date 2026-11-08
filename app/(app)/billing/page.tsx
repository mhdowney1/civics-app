import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { isPaid } from '@/lib/server-access'
import { resolvePriceForUser } from '@/lib/server-pricing'
import { getPostHogClient } from '@/lib/posthog-server'
import { DEFAULT_PRICE_VARIANT, PRICE_VARIANTS, formatPrice } from '@/lib/pricing'
import { BillingContent } from './billing-content'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Unlock full access · Civics Study' }

// Kill switch: express checkout is on unless the PostHog flag
// `express_checkout` exists and is turned off.
async function isExpressCheckoutEnabled(userId: string): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) return false
  try {
    const enabled = await getPostHogClient().isFeatureEnabled('express_checkout', userId)
    return enabled !== false
  } catch {
    return true
  }
}

export default async function BillingPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  if (await isPaid(userId)) redirect('/dashboard')

  const [cents, expressEnabled] = await Promise.all([
    resolvePriceForUser(userId)
      .then((p) => p.cents)
      .catch(() => PRICE_VARIANTS[DEFAULT_PRICE_VARIANT].cents),
    isExpressCheckoutEnabled(userId),
  ])

  return <BillingContent price={formatPrice(cents)} expressEnabled={expressEnabled} />
}
