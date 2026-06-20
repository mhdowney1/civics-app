import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

function detectLocale(acceptLanguage: string): 'en' | 'es' {
  // Parse "es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7" → check for any 'es' preference
  return acceptLanguage
    .split(',')
    .some((tag) => tag.trim().toLowerCase().startsWith('es'))
    ? 'es'
    : 'en'
}

export default getRequestConfig(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()])

  // Explicit user preference always wins
  const cookieLocale = cookieStore.get('civics:language')?.value
  const locale: 'en' | 'es' =
    cookieLocale === 'en' || cookieLocale === 'es'
      ? cookieLocale
      : detectLocale(headerStore.get('accept-language') ?? '')

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
