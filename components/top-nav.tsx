'use client'

import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { useLanguage } from '@/lib/use-language'

export function TopNav() {
  const { isSignedIn } = useUser()
  const [lang, toggleLang] = useLanguage()
  const t = useTranslations('nav')

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
              <button
                type="button"
                onClick={toggleLang}
                className="rounded border border-border px-2 py-0.5 text-xs font-semibold tracking-wider hover:border-foreground/40 hover:text-foreground"
                aria-label={lang === 'en' ? t('switchToSpanish') : t('switchToEnglish')}
              >
                {t('langToggle')}
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
          />
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleLang}
                className="rounded border border-border px-2 py-0.5 text-xs font-semibold tracking-wider hover:border-foreground/40 hover:text-foreground"
                aria-label={lang === 'en' ? t('switchToSpanish') : t('switchToEnglish')}
              >
                {t('langToggle')}
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
