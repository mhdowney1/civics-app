'use client'

import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/85 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-3">
        <Link
          href="/dashboard"
          className="font-display text-lg font-semibold tracking-tight"
        >
          US Civics
        </Link>
        <div className="flex items-center gap-4 text-sm text-muted">
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
            appearance={{ elements: { userButtonAvatarBox: 'h-8 w-8' } }}
          />
        </div>
      </nav>
    </header>
  )
}
