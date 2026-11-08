import { auth, currentUser } from '@clerk/nextjs/server'
import type Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { getPostHogClient } from '@/lib/posthog-server'
import { getStripe, getBaseUrl } from '@/lib/stripe'
import { resolvePriceForUser } from '@/lib/server-pricing'
import { isPaid } from '@/lib/server-access'

type CheckoutUi = 'elements' | 'hosted'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  // A stale tab shouldn't be able to charge someone twice.
  if (await isPaid(userId)) {
    return NextResponse.json({ alreadyPaid: true }, { status: 409 })
  }

  const body = (await req.json().catch(() => ({}))) as {
    referralCode?: unknown
    ui?: unknown
  }
  const referralCode = typeof body.referralCode === 'string' ? body.referralCode : undefined
  const ui: CheckoutUi = body.ui === 'elements' ? 'elements' : 'hosted'

  let price
  try {
    price = await resolvePriceForUser(userId)
  } catch {
    return NextResponse.json({ error: 'Stripe price not configured' }, { status: 500 })
  }

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress
  const base = getBaseUrl()

  const referralCouponId = process.env.STRIPE_REFERRAL_COUPON_ID
  const discountOptions: Pick<
    Stripe.Checkout.SessionCreateParams,
    'discounts' | 'allow_promotion_codes'
  > =
    referralCouponId && referralCode
      ? { discounts: [{ coupon: referralCouponId }] }
      : { allow_promotion_codes: true }

  const common: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    line_items: [{ price: price.priceId, quantity: 1 }],
    metadata: {
      userId,
      priceVariant: price.variant,
      checkoutUi: ui,
      ...(referralCode && { referralCode }),
    },
    ...discountOptions,
    automatic_tax: { enabled: true },
    ...(email && { customer_email: email }),
  }

  const session = await getStripe().checkout.sessions.create(
    ui === 'elements'
      ? {
          ...common,
          ui_mode: 'elements',
          return_url: `${base}/billing/complete?session_id={CHECKOUT_SESSION_ID}`,
        }
      : {
          ...common,
          success_url: `${base}/billing/complete?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${base}/billing`,
          locale: 'auto',
        },
  )

  getPostHogClient().capture({
    distinctId: userId,
    event: 'checkout_session_created',
    properties: {
      price_id: price.priceId,
      price_variant: price.variant,
      amount_cents: price.cents,
      checkout_ui: ui,
    },
  })

  return ui === 'elements'
    ? NextResponse.json({ clientSecret: session.client_secret })
    : NextResponse.json({ url: session.url })
}
