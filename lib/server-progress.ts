import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { progress } from '@/db/schema'
import type { ProgressRecord, Status } from './types'

export async function getServerProgress(): Promise<ProgressRecord[]> {
  const { userId } = await auth()
  if (!userId) return []
  const rows = await db
    .select()
    .from(progress)
    .where(eq(progress.userId, userId))
  return rows.map((r) => ({
    questionId: r.questionId,
    status: r.status as Status,
    timesCorrect: r.timesCorrect,
    timesIncorrect: r.timesIncorrect,
    lastReviewed: r.lastReviewed ? r.lastReviewed.toISOString() : null,
  }))
}
