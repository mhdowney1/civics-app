import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/db/client'
import { usersMeta, referrals, payments } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

// GET — return the current user's referral code (create row if missing)
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await db
    .select({ referralCode: usersMeta.referralCode })
    .from(usersMeta)
    .where(eq(usersMeta.userId, userId))
    .limit(1)

  if (existing[0]) {
    return NextResponse.json({ referralCode: existing[0].referralCode })
  }

  // User pre-dates the users_meta table; create a row with just the referral code
  const referralCode = crypto.randomUUID().replace(/-/g, '').slice(0, 10)
  await db.insert(usersMeta).values({
    userId,
    email: '',
    referralCode,
  }).onConflictDoNothing()

  return NextResponse.json({ referralCode })
}

// POST — record a referral when a referred user visits with a ref code
// Body: { referralCode: string }
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as { referralCode?: string }
  const { referralCode } = body
  if (!referralCode) {
    return NextResponse.json({ error: 'Missing referralCode' }, { status: 400 })
  }

  // Find the referrer
  const referrer = await db
    .select({ userId: usersMeta.userId })
    .from(usersMeta)
    .where(eq(usersMeta.referralCode, referralCode))
    .limit(1)

  if (!referrer[0] || referrer[0].userId === userId) {
    return NextResponse.json({ ok: true })
  }

  // Insert referral (ignore if already exists)
  await db.insert(referrals).values({
    referrerUserId: referrer[0].userId,
    referredUserId: userId,
    referralCode,
  }).onConflictDoNothing()

  // Grant 1 bonus test to the referred user (upsert payments row)
  await db
    .insert(payments)
    .values({ userId, bonusTests: 1 })
    .onConflictDoUpdate({
      target: payments.userId,
      set: { bonusTests: sql`${payments.bonusTests} + 1` },
    })

  return NextResponse.json({ ok: true, bonusGranted: true })
}
