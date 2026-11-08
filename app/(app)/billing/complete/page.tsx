import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getTranslations } from 'next-intl/server'
import { getStripe } from '@/lib/stripe'
import { fulfillCheckoutSession } from '@/lib/fulfill-checkout'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Payment · Civics Study' }

// Stripe sends the buyer here after paying (hosted success_url and the
// Express Checkout return_url). We fulfil right away instead of waiting
// for the webhook, so the user never lands on a still-locked dashboard.
export default async function BillingCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const [{ userId }, { session_id: sessionId }] = await Promise.all([auth(), searchParams])
  if (!userId) redirect('/sign-in')
  if (!sessionId) redirect('/billing')

  let session
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId)
  } catch {
    redirect('/billing')
  }

  // Never fulfil someone else's session from a shared or guessed URL.
  if (session.metadata?.userId !== userId) redirect('/billing')

  const result = await fulfillCheckoutSession(session)
  if (result.status === 'fulfilled' || result.status === 'already_fulfilled') {
    redirect('/dashboard?paid=1')
  }

  // Payment not confirmed yet (e.g. an async method still processing).
  // The webhook will unlock the account when it clears.
  const t = await getTranslations('billing')
  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {t('processingTitle')}
      </h1>
      <p className="mt-3 text-muted">{t('processingDesc')}</p>
      <Link
        href="/dashboard"
        className="mt-8 inline-block rounded-2xl border border-border px-6 py-3.5 font-display font-semibold"
      >
        {t('goToDashboard')}
      </Link>
    </div>
  )
}
