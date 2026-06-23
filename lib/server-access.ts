import { eq, sql } from 'drizzle-orm'
import { db } from '@/db/client'
import { payments } from '@/db/schema'

function isPaymentRequired(): boolean {
  return process.env.PAYMENT_REQUIRED === 'true'
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
  if (!isPaymentRequired()) return true
  return isPaid(userId)
}

// Returns access (paid or payment not required) and freeRemaining (free test not yet used).
export async function getTestAccess(
  userId: string,
): Promise<{ access: boolean; freeRemaining: boolean }> {
  if (!isPaymentRequired()) return { access: true, freeRemaining: true }

  const rows = await db
    .select({ status: payments.status, freeTestUsedAt: payments.freeTestUsedAt })
    .from(payments)
    .where(eq(payments.userId, userId))
    .limit(1)

  const row = rows[0]
  const paidUser = row?.status === 'paid'
  const freeRemaining = !row || row.freeTestUsedAt === null

  return { access: paidUser, freeRemaining }
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
