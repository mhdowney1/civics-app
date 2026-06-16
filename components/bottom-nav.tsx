'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function BottomNav() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Study' },
    { href: '/progress', label: 'Progress' },
    { href: '/test', label: 'Mock test' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur sm:hidden">
      <div className="flex">
        {links.map(({ href, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 items-center justify-center py-3 text-xs font-medium transition-colors ${
                active ? 'text-foreground' : 'text-muted hover:text-foreground'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
