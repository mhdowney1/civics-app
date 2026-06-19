'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { setLanguage } from '@/app/actions/set-language'

export type Lang = 'en' | 'es'

export function useLanguage(): [Lang, () => void] {
  const locale = useLocale() as Lang
  const router = useRouter()

  const toggle = () => {
    const next = locale === 'en' ? 'es' : 'en'
    setLanguage(next).then(() => router.refresh())
  }

  return [locale, toggle]
}
