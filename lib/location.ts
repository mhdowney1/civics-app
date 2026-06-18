const LOCATION_KEY = 'civics:location'

export interface LocationData {
  zip: string
  state: string
  senators: string[]
  representative: string
  governor: string
  stateCapital: string
}

export function getStoredLocation(): LocationData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LOCATION_KEY)
    return raw ? (JSON.parse(raw) as LocationData) : null
  } catch {
    return null
  }
}

export function setStoredLocation(data: LocationData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCATION_KEY, JSON.stringify(data))
}

export function clearStoredLocation(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LOCATION_KEY)
}
