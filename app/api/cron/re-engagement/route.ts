import { NextResponse } from 'next/server'
import { db } from '@/db/client'
import { emailSequences, usersMeta, progress } from '@/db/schema'
import { and, isNotNull, lt, gt, notInArray, max, sql } from 'drizzle-orm'
import { sendEmail, reEngagementEmail } from '@/lib/email'

// Runs daily via Vercel Cron. Re-engages users inactive for 3–30 days.
export async function GET(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const now = new Date()
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Users who already received a re-engagement email
  const alreadySent = await db
    .select({ userId: emailSequences.userId })
    .from(emailSequences)
    .where(
      and(
        sql`${emailSequences.type} = 're_engagement'`,
        isNotNull(emailSequences.sentAt),
        gt(emailSequences.sentAt, thirtyDaysAgo),
      ),
    )
  const excludeIds = alreadySent.map((r) => r.userId)

  // Users with last study activity 3–30 days ago
  const activeUsersQuery = db
    .select({
      userId: progress.userId,
      lastActive: max(progress.lastReviewed).as('last_active'),
    })
    .from(progress)
    .groupBy(progress.userId)
    .as('active_users')

  // Join with users_meta to get email/name, filter by inactivity window
  const candidates = await db
    .select({
      userId: usersMeta.userId,
      email: usersMeta.email,
      firstName: usersMeta.firstName,
    })
    .from(usersMeta)
    .innerJoin(activeUsersQuery, sql`${usersMeta.userId} = ${activeUsersQuery.userId}`)
    .where(
      and(
        lt(activeUsersQuery.lastActive, threeDaysAgo),
        gt(activeUsersQuery.lastActive, thirtyDaysAgo),
        excludeIds.length > 0
          ? notInArray(usersMeta.userId, excludeIds)
          : sql`TRUE`,
      ),
    )
    .limit(50)

  let sent = 0
  for (const user of candidates) {
    await sendEmail(
      user.email,
      'Your citizenship prep is waiting — 5 minutes today keeps you on track',
      reEngagementEmail(user.firstName),
    )
    await db.insert(emailSequences).values({
      userId: user.userId,
      type: 're_engagement',
      scheduledFor: now,
      sentAt: now,
    })
    sent++
  }

  return NextResponse.json({ sent })
}
