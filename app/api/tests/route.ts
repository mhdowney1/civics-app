import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { eq, desc } from 'drizzle-orm'
import { db } from '@/db/client'
import { mockTests } from '@/db/schema'

export const runtime = 'nodejs'

const PASS_THRESHOLD = 12

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(mockTests)
    .where(eq(mockTests.userId, userId))
    .orderBy(desc(mockTests.takenAt))

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      score: r.score,
      total: r.total,
      passed: r.passed,
      takenAt: r.takenAt.toISOString(),
    })),
  )
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  let body: { score: unknown; total: unknown }
  try {
    body = (await req.json()) as { score: unknown; total: unknown }
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const score = Number(body.score)
  const total = Number(body.total)
  if (
    !Number.isInteger(score) ||
    !Number.isInteger(total) ||
    score < 0 ||
    total < 1 ||
    score > total
  ) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  await db.insert(mockTests).values({
    userId,
    score,
    total,
    passed: score >= PASS_THRESHOLD,
  })

  return NextResponse.json({ ok: true })
}
