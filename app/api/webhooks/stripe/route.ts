import type Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { fulfillCheckoutSession } from '@/lib/fulfill-checkout'

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const result = await fulfillCheckoutSession(event.data.object)
    if (result.status === 'missing_user') {
      return NextResponse.json({ error: 'Missing userId in metadata' }, { status: 400 })
    }
  }

  return NextResponse.json({ received: true })
}
