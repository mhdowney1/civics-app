const FONT_SIZE_KEY = 'civics:font-size'

export type FontSize = 'normal' | 'large' | 'larger'

export function getFontSize(): FontSize {
  if (typeof window === 'undefined') return 'normal'
  return (localStorage.getItem(FONT_SIZE_KEY) as FontSize | null) ?? 'normal'
}

export function applyFontSize(size: FontSize) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.remove('font-large', 'font-larger')
  if (size === 'large') document.documentElement.classList.add('font-large')
  if (size === 'larger') document.documentElement.classList.add('font-larger')
}

export function setFontSize(size: FontSize) {
  if (typeof window === 'undefined') return
  localStorage.setItem(FONT_SIZE_KEY, size)
  document.cookie = `${FONT_SIZE_KEY}=${size};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`
  applyFontSize(size)
}
