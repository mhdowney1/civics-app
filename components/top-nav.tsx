'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { useLanguage, type Lang } from '@/lib/use-language'
import { getTheme, toggleTheme, type Theme } from '@/lib/theme'

export function TopNav() {
  const { isSignedIn } = useUser()
  const [lang, toggleLang] = useLanguage()
  const t = useTranslations('nav')
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    setTheme(getTheme())
  }, [])

  function handleToggleTheme() {
    setTheme(toggleTheme())
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/85 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-3">
        <Link
          href={isSignedIn ? '/dashboard' : '/'}
          className="font-display text-lg font-semibold tracking-tight"
        >
          US Civics
        </Link>
        <div className="flex items-center gap-4 text-sm text-muted">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="hidden hover:text-foreground sm:inline"
              >
                {t('study')}
              </Link>
              <Link
                href="/progress"
                className="hidden hover:text-foreground sm:inline"
              >
                {t('progress')}
              </Link>
              <Link
                href="/test"
                className="hidden hover:text-foreground sm:inline"
              >
                {t('mockTest')}
              </Link>
              <LangSegment lang={lang} onToggle={toggleLang} />
              <button
                type="button"
                onClick={handleToggleTheme}
                className="rounded border border-border px-2 py-0.5 text-xs hover:border-foreground/40 hover:text-foreground"
                aria-label={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
              >
                {theme === 'dark' ? '☀︎' : '☾'}
              </button>
              <UserButton
            appearance={{

              variables: {
                colorBackground: '#1a1a1a',
                colorNeutral: 'white',
                colorPrimary: '#ffffff',
                colorForeground: 'white',
                colorInput: '#2a2a2a',
                colorInputForeground: 'white',
              },
              elements: {
                userButtonAvatarBox: 'h-8 w-8',
                userButtonPopoverCard: 'border border-[#2a2a2a]',
              },
            }}
            userProfileProps={{
              appearance: {
                variables: {
                  colorBackground: '#1a1a1a',
                  colorNeutral: 'white',
                  colorPrimary: '#ffffff',
                  colorForeground: 'white',
                  colorInput: '#2a2a2a',
                  colorInputForeground: 'white',
                },
              },
            }}
          >
            <UserButton.MenuItems>
              <UserButton.Link
                label="Settings"
                href="/settings"
                labelIcon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>}
              />
            </UserButton.MenuItems>
          </UserButton>
            </>
          ) : (
            <>
              <LangSegment lang={lang} onToggle={toggleLang} />
              <button
                type="button"
                onClick={handleToggleTheme}
                className="rounded border border-border px-2 py-0.5 text-xs hover:border-foreground/40 hover:text-foreground"
                aria-label={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
              >
                {theme === 'dark' ? '☀︎' : '☾'}
              </button>
              <Link
                href="/sign-up"
                className="rounded-full bg-confident px-3 py-1.5 text-xs font-semibold text-black"
              >
                {t('signUp')}
              </Link>
            </>
          )}
        </div>
      </nav>
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
