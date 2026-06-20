import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="w-full border-b border-border">
        <div className="mx-auto flex max-w-3xl px-5 py-3">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight">
            US Civics
          </Link>
        </div>
      </header>
      {children}
    </div>
  )
}
