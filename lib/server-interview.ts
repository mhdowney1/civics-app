import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { usersMeta } from '@/db/schema'

export async function getInterviewDate(userId: string): Promise<string | null> {
  const rows = await db
    .select({ interviewDate: usersMeta.interviewDate })
    .from(usersMeta)
    .where(eq(usersMeta.userId, userId))
    .limit(1)
  return rows[0]?.interviewDate ?? null
}
