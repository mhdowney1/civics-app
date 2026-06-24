'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { useLanguage, type Lang } from '@/lib/use-language'
import { getTheme, toggleTheme, type Theme } from '@/lib/theme'

export function LandingHeader() {
  const { isSignedIn } = useUser()
  const [lang, toggleLang] = useLanguage()
  const t = useTranslations('nav')
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    setTheme(getTheme())
  }, [])

  return (
    <header className="w-full pt-[env(safe-area-inset-top)]">
    <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
      <div className="font-display text-lg font-semibold tracking-tight">
        Civics Study
      </div>
      <nav className="flex items-center gap-3 text-sm text-muted">
        <LangSegment lang={lang} onToggle={toggleLang} />
        {isSignedIn ? (
          <>
            <button
              type="button"
              onClick={() => setTheme(toggleTheme())}
              className="rounded border border-border px-2 py-0.5 text-xs hover:border-foreground/40 hover:text-foreground"
              aria-label={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
            >
              {theme === 'dark' ? '☀︎' : '☾'}
            </button>
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard →
            </Link>
          </>
        ) : (
          <>
            <Link href="/sign-in" className="hover:text-foreground">
              {t('signIn')}
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-confident px-3 py-1.5 text-xs font-semibold text-black"
            >
              {t('signUp')}
            </Link>
          </>
        )}
      </nav>
    </div>
    </header>
  )
}

function LangSegment({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <div className="flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-semibold tracking-wider">
      {(['en', 'es'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => lang !== l && onToggle()}
          className={`rounded-full px-2.5 py-0.5 transition ${
            lang === l
              ? 'bg-foreground text-background'
              : 'text-muted hover:text-foreground'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
