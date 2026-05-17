import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/db/client'
import { progress, STATUS_VALUES, type Status } from '@/db/schema'

export const runtime = 'nodejs'

type Body = {
  questionId: unknown
  status: unknown
}

function isStatus(value: unknown): value is Status {
  return (
    typeof value === 'string' && (STATUS_VALUES as readonly string[]).includes(value)
  )
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(progress)
    .where(eq(progress.userId, userId))

  return NextResponse.json(
    rows.map((r) => ({
      questionId: r.questionId,
      status: r.status as Status,
      timesCorrect: r.timesCorrect,
      timesIncorrect: r.timesIncorrect,
      lastReviewed: r.lastReviewed ? r.lastReviewed.toISOString() : null,
    })),
  )
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const questionId = Number(body.questionId)
  if (!Number.isInteger(questionId) || questionId < 1 || questionId > 128) {
    return NextResponse.json({ error: 'invalid_question_id' }, { status: 400 })
  }
  if (!isStatus(body.status)) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 })
  }

  const status = body.status
  const incCorrect = status === 'confident' ? 1 : 0
  const incIncorrect = status === 'needs_practice' ? 1 : 0

  await db
    .insert(progress)
    .values({
      userId,
      questionId,
      status,
      timesCorrect: incCorrect,
      timesIncorrect: incIncorrect,
      lastReviewed: new Date(),
    })
    .onConflictDoUpdate({
      target: [progress.userId, progress.questionId],
      set: {
        status,
        timesCorrect: sql`${progress.timesCorrect} + ${incCorrect}`,
        timesIncorrect: sql`${progress.timesIncorrect} + ${incIncorrect}`,
        lastReviewed: new Date(),
      },
    })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }
  await db.delete(progress).where(eq(progress.userId, userId))
  return NextResponse.json({ ok: true })
}
