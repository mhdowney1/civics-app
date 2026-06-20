const THEME_KEY = 'civics:theme'

export type Theme = 'dark' | 'light'

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  return (localStorage.getItem(THEME_KEY) as Theme | null) ?? 'dark'
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  if (theme === 'light') {
    document.documentElement.classList.add('light')
  } else {
    document.documentElement.classList.remove('light')
  }
}

export function setTheme(theme: Theme) {
  if (typeof window === 'undefined') return
  localStorage.setItem(THEME_KEY, theme)
  // Cookie lets the server render the correct theme class on <html> without an inline script
  document.cookie = `${THEME_KEY}=${theme};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`
  applyTheme(theme)
}

export function toggleTheme(): Theme {
  const next = getTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}
