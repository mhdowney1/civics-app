import { auth } from '@clerk/nextjs/server'
import { eq, desc } from 'drizzle-orm'
import { db } from '@/db/client'
import { mockTests } from '@/db/schema'

export type TestRun = {
  id: number
  score: number
  total: number
  passed: boolean
  takenAt: string
}

export async function getRecentTests(limit = 5): Promise<TestRun[]> {
  const { userId } = await auth()
  if (!userId) return []
  const rows = await db
    .select()
    .from(mockTests)
    .where(eq(mockTests.userId, userId))
    .orderBy(desc(mockTests.takenAt))
    .limit(limit)
  return rows.map((r) => ({
    id: r.id,
    score: r.score,
    total: r.total,
    passed: r.passed,
    takenAt: r.takenAt.toISOString(),
  }))
}

export async function getAllTests(): Promise<TestRun[]> {
  const { userId } = await auth()
  if (!userId) return []
  const rows = await db
    .select()
    .from(mockTests)
    .where(eq(mockTests.userId, userId))
    .orderBy(desc(mockTests.takenAt))
  return rows.map((r) => ({
    id: r.id,
    score: r.score,
    total: r.total,
    passed: r.passed,
    takenAt: r.takenAt.toISOString(),
  }))
}
