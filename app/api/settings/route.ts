import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { usersMeta } from '@/db/schema'

const VALID_GOALS = [5, 10, 20]
const VALID_FONT_SIZES = ['normal', 'large', 'larger']

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json() as {
    zip?: string | null
    dailyGoal?: number | null
    fontSize?: string | null
  }

  const update: Partial<typeof usersMeta.$inferInsert> = {}

  if ('zip' in body) {
    if (body.zip !== null && !/^\d{5}$/.test(body.zip ?? '')) {
      return new Response('Invalid ZIP', { status: 400 })
    }
    update.zip = body.zip ?? null
  }

  if ('dailyGoal' in body) {
    if (body.dailyGoal !== null && !VALID_GOALS.includes(body.dailyGoal ?? 0)) {
      return new Response('Invalid daily goal', { status: 400 })
    }
    update.dailyGoal = body.dailyGoal ?? null
  }

  if ('fontSize' in body) {
    if (body.fontSize !== null && !VALID_FONT_SIZES.includes(body.fontSize ?? '')) {
      return new Response('Invalid font size', { status: 400 })
    }
    update.fontSize = body.fontSize ?? null
  }

  if (Object.keys(update).length === 0) {
    return new Response('No fields to update', { status: 400 })
  }

  await db.update(usersMeta).set(update).where(eq(usersMeta.userId, userId))

  return new Response(null, { status: 204 })
}
