import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { db } from '@/db/client'
import { payments, usersMeta } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getPostHogClient } from '@/lib/posthog-server'
import { sendEmail, paymentReceiptEmail } from '@/lib/email'

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = new Stripe(secretKey)
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId in metadata' }, { status: 400 })
    }

    const existing = await db
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.userId, userId))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(payments)
        .set({
          status: 'paid',
          stripePaymentIntentId: session.payment_intent as string | null,
          stripeCustomerId: session.customer as string | null,
          amountCents: session.amount_total,
          paidAt: new Date(),
        })
        .where(eq(payments.userId, userId))
    } else {
      await db.insert(payments).values({
        userId,
        status: 'paid',
        stripePaymentIntentId: session.payment_intent as string | null,
        stripeCustomerId: session.customer as string | null,
        amountCents: session.amount_total,
        paidAt: new Date(),
      })
    }

    getPostHogClient().capture({
      distinctId: userId,
      event: 'payment_completed',
      properties: {
        amount_cents: session.amount_total,
        stripe_session_id: session.id,
      },
    })

    const userRow = await db
      .select({ email: usersMeta.email, firstName: usersMeta.firstName })
      .from(usersMeta)
      .where(eq(usersMeta.userId, userId))
      .limit(1)

    if (userRow[0]) {
      await sendEmail(
        userRow[0].email,
        'You\'re unlocked — unlimited mock tests on civicsstudy.com',
        paymentReceiptEmail(userRow[0].firstName),
      )
    }
  }

  return NextResponse.json({ received: true })
}
