'use server'

import { cookies } from 'next/headers'

export async function setLanguage(lang: 'en' | 'es') {
  const store = await cookies()
  store.set('civics:language', lang, { maxAge: 60 * 60 * 24 * 365, path: '/' })
}
