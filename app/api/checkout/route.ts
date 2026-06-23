import { auth, currentUser } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { getPostHogClient } from '@/lib/posthog-server'

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 },
    )
  }

  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) {
    return NextResponse.json(
      { error: 'Stripe price not configured' },
      { status: 500 },
    )
  }

  const body = await req.json().catch(() => ({})) as { referralCode?: string }
  const referralCode = typeof body.referralCode === 'string' ? body.referralCode : undefined

  const stripe = new Stripe(secretKey)
  const base = getBaseUrl()
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress

  const referralCouponId = process.env.STRIPE_REFERRAL_COUPON_ID
  const discountOptions = referralCouponId && referralCode
    ? { discounts: [{ coupon: referralCouponId }] }
    : { allow_promotion_codes: true }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/dashboard?paid=1`,
    cancel_url: `${base}/billing`,
    metadata: { userId, ...(referralCode && { referralCode }) },
    ...discountOptions,
    automatic_tax: { enabled: true },
    ...(email && { customer_email: email }),
    locale: 'auto',
  })

  getPostHogClient().capture({
    distinctId: userId,
    event: 'checkout_session_created',
    properties: { price_id: priceId },
  })

  return NextResponse.json({ url: session.url })
}
