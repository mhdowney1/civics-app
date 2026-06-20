const PREFIX = 'civics:session'

export interface SavedSession {
  questionIds: number[]
  index: number
  savedAt: number
}

function key(mode: string, category?: string) {
  return `${PREFIX}:${mode}:${category ?? 'none'}`
}

export function saveSession(mode: string, category: string | undefined, questionIds: number[], index: number) {
  if (typeof window === 'undefined') return
  try {
    const data: SavedSession = { questionIds, index, savedAt: Date.now() }
    localStorage.setItem(key(mode, category), JSON.stringify(data))
  } catch {
    /* ignore quota errors */
  }
}

export function loadSession(mode: string, category?: string): SavedSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key(mode, category))
    if (!raw) return null
    const data = JSON.parse(raw) as SavedSession
    // Expire sessions older than 7 days
    if (Date.now() - data.savedAt > 7 * 24 * 60 * 60 * 1000) {
      clearSession(mode, category)
      return null
    }
    return data
  } catch {
    return null
  }
}

export function clearSession(mode: string, category?: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key(mode, category))
  } catch {
    /* ignore */
  }
}
