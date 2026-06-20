import { eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { usersMeta } from '@/db/schema'

export interface UserSettings {
  zip: string | null
  dailyGoal: number | null
  fontSize: string | null
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const rows = await db
    .select({ zip: usersMeta.zip, dailyGoal: usersMeta.dailyGoal, fontSize: usersMeta.fontSize })
    .from(usersMeta)
    .where(eq(usersMeta.userId, userId))
    .limit(1)
  return rows[0] ?? { zip: null, dailyGoal: null, fontSize: null }
}
