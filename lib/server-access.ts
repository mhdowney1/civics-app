import { eq, sql } from 'drizzle-orm'
import { db } from '@/db/client'
import { payments } from '@/db/schema'
import { getPostHogClient } from '@/lib/posthog-server'

async function isPaymentFlagEnabled(userId: string): Promise<boolean> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return false
  try {
    const flags = await getPostHogClient().evaluateFlags(userId)
    return flags.isEnabled('payment_enabled') === true
  } catch {
    // If PostHog is unreachable, default to open access so users aren't blocked
    return false
  }
}

export async function isPaid(userId: string): Promise<boolean> {
  const rows = await db
    .select({ status: payments.status })
    .from(payments)
    .where(eq(payments.userId, userId))
    .limit(1)
  return rows[0]?.status === 'paid'
}

export async function hasAccess(userId: string): Promise<boolean> {
  const flagOn = await isPaymentFlagEnabled(userId)
  if (!flagOn) return true
  return isPaid(userId)
}

// Fetches flag + payments row in one DB round-trip for the /test page.
// Returns access (paid or flag off) and freeRemaining (free test not yet used).
export async function getTestAccess(
  userId: string,
): Promise<{ access: boolean; freeRemaining: boolean }> {
  const [flagOn, rows] = await Promise.all([
    isPaymentFlagEnabled(userId),
    db
      .select({ status: payments.status, freeTestUsedAt: payments.freeTestUsedAt })
      .from(payments)
      .where(eq(payments.userId, userId))
      .limit(1),
  ])

  const row = rows[0]
  const paidUser = row?.status === 'paid'
  const access = !flagOn || paidUser
  const freeRemaining = !row || row.freeTestUsedAt === null

  return { access, freeRemaining }
}

// Atomically stamps the free test. Safe under concurrent requests:
// COALESCE preserves an existing timestamp, so a race between two
// requests only stamps once and both see the same result.
export async function stampFreeTestUsed(userId: string): Promise<void> {
  await db
    .insert(payments)
    .values({ userId, freeTestUsedAt: new Date() })
    .onConflictDoUpdate({
      target: payments.userId,
      set: {
        freeTestUsedAt: sql`COALESCE(${payments.freeTestUsedAt}, EXCLUDED.free_test_used_at)`,
      },
    })
}
