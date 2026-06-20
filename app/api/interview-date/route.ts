import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { usersMeta } from '@/db/schema'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const body = await req.json() as { date: string | null }
  const { date } = body

  if (date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Response('Invalid date format', { status: 400 })
  }

  await db
    .update(usersMeta)
    .set({ interviewDate: date })
    .where(eq(usersMeta.userId, userId))

  return new Response(null, { status: 204 })
}
