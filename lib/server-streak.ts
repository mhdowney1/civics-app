import { sql, eq } from 'drizzle-orm'
import { db } from '@/db/client'
import { progress } from '@/db/schema'

export interface StreakResult {
  streak: number
  lastStudied: string | null // YYYY-MM-DD
}

export async function getServerStreak(userId: string): Promise<StreakResult> {
  // Pull distinct calendar dates (UTC) on which the user answered any question,
  // sorted most-recent first. We derive this from the existing lastReviewed column
  // — no schema change required.
  const result = await db.execute(sql`
    SELECT DISTINCT DATE(${progress.lastReviewed} AT TIME ZONE 'UTC') AS study_date
    FROM ${progress}
    WHERE ${eq(progress.userId, userId)}
      AND ${progress.lastReviewed} IS NOT NULL
    ORDER BY study_date DESC
  `)

  const dates = (result.rows as Array<{ study_date: string }>)
    .map((r) => r.study_date)
    .filter(Boolean)

  if (dates.length === 0) return { streak: 0, lastStudied: null }

  const lastStudied = dates[0]
  const dateSet = new Set(dates)

  // Walk backward from today counting consecutive study days.
  // If the user hasn't studied today, start the walk from yesterday so the
  // streak survives until end-of-day (same behaviour as Duolingo).
  const todayUTC = new Date()
  todayUTC.setUTCHours(0, 0, 0, 0)
  const todayStr = todayUTC.toISOString().slice(0, 10)

  const prev = new Date(todayUTC)
  prev.setUTCDate(prev.getUTCDate() - 1)
  const yesterdayStr = prev.toISOString().slice(0, 10)

  // If neither today nor yesterday has a study event the streak has broken.
  if (!dateSet.has(todayStr) && !dateSet.has(yesterdayStr)) {
    return { streak: 0, lastStudied }
  }

  let cursor = new Date(dateSet.has(todayStr) ? todayUTC : prev)
  let streak = 0

  while (dateSet.has(cursor.toISOString().slice(0, 10))) {
    streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }

  return { streak, lastStudied }
}
