import type { Status } from './types'

const QUEUE_KEY = 'civics:offline-queue'
const CACHE_KEY = 'civics:progress-cache'

export interface OfflineEntry {
  questionId: number
  status: Status
  at: number
}

export interface CachedProgress {
  questionId: number
  status: Status
  timesCorrect: number
  timesIncorrect: number
  lastReviewed: string | null
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

export function readQueue(): OfflineEntry[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as OfflineEntry[]) : []
  } catch {
    return []
  }
}

export function writeQueue(entries: OfflineEntry[]) {
  if (!isBrowser()) return
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(entries))
  } catch {
    /* ignore quota errors */
  }
}

export function enqueue(entry: OfflineEntry) {
  const queue = readQueue()
  queue.push(entry)
  writeQueue(queue)
}

export function readCache(): CachedProgress[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as CachedProgress[]) : []
  } catch {
    return []
  }
}

export function writeCache(rows: CachedProgress[]) {
  if (!isBrowser()) return
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rows))
  } catch {
    /* ignore quota errors */
  }
}

export function applyToCache(entry: OfflineEntry) {
  const cache = readCache()
  const existing = cache.find((c) => c.questionId === entry.questionId)
  if (existing) {
    existing.status = entry.status
    if (entry.status === 'confident') existing.timesCorrect += 1
    if (entry.status === 'needs_practice') existing.timesIncorrect += 1
    existing.lastReviewed = new Date(entry.at).toISOString()
  } else {
    cache.push({
      questionId: entry.questionId,
      status: entry.status,
      timesCorrect: entry.status === 'confident' ? 1 : 0,
      timesIncorrect: entry.status === 'needs_practice' ? 1 : 0,
      lastReviewed: new Date(entry.at).toISOString(),
    })
  }
  writeCache(cache)
}

export function clearAll() {
  if (!isBrowser()) return
  localStorage.removeItem(QUEUE_KEY)
  localStorage.removeItem(CACHE_KEY)
}
