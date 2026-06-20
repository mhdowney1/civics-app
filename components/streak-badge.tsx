interface StreakBadgeProps {
  streak: number
  lastStudied: string | null // YYYY-MM-DD
}

function daysAgo(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const last = new Date(dateStr)
  last.setHours(0, 0, 0, 0)
  return Math.round((today.getTime() - last.getTime()) / 86400000)
}

export function StreakBadge({ streak, lastStudied }: StreakBadgeProps) {
  if (!streak && !lastStudied) return null

  const ago = lastStudied ? daysAgo(lastStudied) : null

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
      {streak > 1 && (
        <span className="inline-flex items-center gap-1 rounded-full border border-confident/30 bg-confident/10 px-2.5 py-1 font-medium text-confident">
          {streak} day streak
        </span>
      )}
      {ago !== null && (
        <span>
          {ago === 0
            ? 'Studied today'
            : ago === 1
              ? 'Last studied yesterday'
              : `Last studied ${ago} days ago`}
        </span>
      )}
    </div>
  )
}
