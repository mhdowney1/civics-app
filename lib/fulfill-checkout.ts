import 'server-only'
import type Stripe from 'stripe'
import { and, eq, ne, sql } from 'drizzle-orm'
import { db } from '@/db/client'
import { payments, usersMeta, referrals } from '@/db/schema'
import { getPostHogClient } from '@/lib/posthog-server'
import { sendEmail, paymentReceiptEmail } from '@/lib/email'
import { getStripe } from '@/lib/stripe'

export type FulfillResult =
  | { status: 'fulfilled'; userId: string }
  | { status: 'already_fulfilled'; userId: string }
  | { status: 'not_paid' }
  | { status: 'missing_user' }

// Grants access for a completed Checkout Session. Safe to call more than once
// (webhook retries, webhook racing the return page): the payment row is
// claimed with a single conditional upsert, and the email / referral side
// effects only run for the call that actually flipped the row to `paid`.
export async function fulfillCheckoutSession(
  sessionOrId: string | Stripe.Checkout.Session,
): Promise<FulfillResult> {
  const session =
    typeof sessionOrId === 'string'
      ? await getStripe().checkout.sessions.retrieve(sessionOrId)
      : sessionOrId

  const userId = session.metadata?.userId
  if (!userId) return { status: 'missing_user' }

  if (session.status !== 'complete' || session.payment_status === 'unpaid') {
    return { status: 'not_paid' }
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null
  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null

  const claimed = await db
    .insert(payments)
    .values({
      userId,
      status: 'paid',
      stripePaymentIntentId: paymentIntentId,
      stripeCustomerId: customerId,
      amountCents: session.amount_total,
      paidAt: new Date(),
    })
    .onConflictDoUpdate({
      target: payments.userId,
      set: {
        status: 'paid',
        stripePaymentIntentId: paymentIntentId,
        stripeCustomerId: customerId,
        amountCents: session.amount_total,
        paidAt: new Date(),
      },
      setWhere: ne(payments.status, 'paid'),
    })
    .returning({ id: payments.id })

  if (claimed.length === 0) {
    // Row was already paid. If it was paid by a *different* payment intent,
    // this is a duplicate charge worth knowing about.
    const existing = await db
      .select({ pi: payments.stripePaymentIntentId })
      .from(payments)
      .where(and(eq(payments.userId, userId), eq(payments.status, 'paid')))
      .limit(1)
    if (existing[0] && paymentIntentId && existing[0].pi !== paymentIntentId) {
      getPostHogClient().capture({
        distinctId: userId,
        event: 'duplicate_payment_detected',
        properties: { stripe_session_id: session.id, payment_intent: paymentIntentId },
      })
    }
    return { status: 'already_fulfilled', userId }
  }

  getPostHogClient().capture({
    distinctId: userId,
    event: 'payment_completed',
    properties: {
      amount_cents: session.amount_total,
      stripe_session_id: session.id,
      price_variant: session.metadata?.priceVariant,
      checkout_ui: session.metadata?.checkoutUi,
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
    await creditReferral(referralCode, userId)
  }

  return { status: 'fulfilled', userId }
}

async function creditReferral(referralCode: string, referredUserId: string) {
  const referrer = await db
    .select({ userId: usersMeta.userId })
    .from(usersMeta)
    .where(eq(usersMeta.referralCode, referralCode))
    .limit(1)

  if (!referrer[0] || referrer[0].userId === referredUserId) return

  await db
    .insert(referrals)
    .values({
      referrerUserId: referrer[0].userId,
      referredUserId,
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
    properties: { referred_user_id: referredUserId },
  })
}
