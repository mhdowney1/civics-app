import { NextResponse } from 'next/server'
import { db } from '@/db/client'
import { emailSequences, usersMeta } from '@/db/schema'
import { and, isNull, lte, eq, inArray } from 'drizzle-orm'
import { sendEmail, nudgeEmail, studyTipEmail } from '@/lib/email'

// Runs daily via Vercel Cron. Sends pending drip emails.
export async function GET(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const now = new Date()
  const pending = await db
    .select()
    .from(emailSequences)
    .where(
      and(
        isNull(emailSequences.sentAt),
        lte(emailSequences.scheduledFor, now),
        inArray(emailSequences.type, ['nudge', 'study_tip']),
      ),
    )
    .limit(100)

  if (pending.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const userIds = [...new Set(pending.map((s) => s.userId))]
  const users = await db
    .select()
    .from(usersMeta)
    .where(inArray(usersMeta.userId, userIds))

  const userMap = new Map(users.map((u) => [u.userId, u]))

  let sent = 0
  for (const seq of pending) {
    const user = userMap.get(seq.userId)
    if (!user) continue

    let subject: string
    let html: string

    if (seq.type === 'nudge') {
      subject = 'Have you tried the mock test yet?'
      html = nudgeEmail(user.firstName)
    } else if (seq.type === 'study_tip') {
      subject = 'A few tips to help you pass the civics test'
      html = studyTipEmail(user.firstName)
    } else {
      continue
    }

    await sendEmail(user.email, subject, html)
    await db
      .update(emailSequences)
      .set({ sentAt: new Date() })
      .where(eq(emailSequences.id, seq.id))
    sent++
  }

  return NextResponse.json({ sent })
}
