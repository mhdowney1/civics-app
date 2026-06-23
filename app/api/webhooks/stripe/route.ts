import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { db } from '@/db/client'
import { payments, usersMeta, referrals } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
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

    const referralCode = session.metadata?.referralCode
    if (referralCode) {
      const referrer = await db
        .select({ userId: usersMeta.userId })
        .from(usersMeta)
        .where(eq(usersMeta.referralCode, referralCode))
        .limit(1)

      if (referrer[0] && referrer[0].userId !== userId) {
        await db
          .insert(referrals)
          .values({
            referrerUserId: referrer[0].userId,
            referredUserId: userId,
            referralCode,
            bonusGranted: true,
          })
          .onConflictDoUpdate({
            target: referrals.referredUserId,
            set: { bonusGranted: true },
          })

        // bonusTests on the referrer's row tracks paid referral count for milestone rewards
        await db
          .insert(payments)
          .values({ userId: referrer[0].userId, bonusTests: 1 })
          .onConflictDoUpdate({
            target: payments.userId,
            set: { bonusTests: sql`${payments.bonusTests} + 1` },
          })

        getPostHogClient().capture({
          distinctId: referrer[0].userId,
          event: 'referral_converted',
          properties: { referred_user_id: userId },
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}
