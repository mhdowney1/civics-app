import {
  applyToCache,
  enqueue,
  readCache,
  readQueue,
  writeCache,
  writeQueue,
  type OfflineEntry,
} from './local-progress'
import type { ProgressRecord, Status } from './types'

export async function saveProgress(
  questionId: number,
  status: Status,
): Promise<void> {
  const entry: OfflineEntry = { questionId, status, at: Date.now() }
  applyToCache(entry)

  try {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ questionId, status }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch {
    enqueue(entry)
  }
}

export async function fetchProgress(): Promise<ProgressRecord[]> {
  try {
    const res = await fetch('/api/progress', { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as ProgressRecord[]
    writeCache(
      data.map((d) => ({
        questionId: d.questionId,
        status: d.status,
        timesCorrect: d.timesCorrect,
        timesIncorrect: d.timesIncorrect,
        lastReviewed: d.lastReviewed,
      })),
    )
    return data
  } catch {
    return readCache().map((c) => ({
      questionId: c.questionId,
      status: c.status,
      timesCorrect: c.timesCorrect,
      timesIncorrect: c.timesIncorrect,
      lastReviewed: c.lastReviewed,
    }))
  }
}

export async function resetProgress(): Promise<void> {
  writeCache([])
  writeQueue([])
  await fetch('/api/progress', { method: 'DELETE' })
}

export async function flushQueue(): Promise<void> {
  const queue = readQueue()
  if (queue.length === 0) return
  const remaining: OfflineEntry[] = []
  for (const entry of queue) {
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          questionId: entry.questionId,
          status: entry.status,
        }),
      })
      if (!res.ok) remaining.push(entry)
    } catch {
      remaining.push(entry)
    }
  }
  writeQueue(remaining)
}
