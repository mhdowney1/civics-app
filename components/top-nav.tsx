'use client'

import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'

export function TopNav() {
  const { isSignedIn } = useUser()

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
                Study
              </Link>
              <Link
                href="/progress"
                className="hidden hover:text-foreground sm:inline"
              >
                Progress
              </Link>
              <Link
                href="/test"
                className="hidden hover:text-foreground sm:inline"
              >
                Mock test
              </Link>
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
            <Link
              href="/sign-up"
              className="rounded-full bg-confident px-3 py-1.5 text-xs font-semibold text-black"
            >
              Sign up
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
