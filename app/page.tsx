import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'

export default async function LandingPage() {
  const { userId } = await auth()
  const isSignedIn = Boolean(userId)
  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[80vh] opacity-60"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(74,222,128,0.18) 0%, rgba(15,15,15,0) 70%)',
        }}
      />
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
        <div className="font-display text-lg font-semibold tracking-tight">
          US Civics
        </div>
        <nav className="flex items-center gap-4 text-sm text-muted">
          {isSignedIn ? (
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="hover:text-foreground">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-confident px-3 py-1.5 text-xs font-semibold text-black"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-5 pb-16 pt-12 sm:pt-20">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          2025 USCIS Civics Test
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Calm, oral-style practice for the US citizenship test.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          See the question, think your answer, then check yourself. No multiple
          choice. No clutter. Just the 128 official questions, paced like the
          real interview.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="rounded-2xl bg-confident px-6 py-3.5 font-display text-base font-semibold text-black transition hover:opacity-90"
            >
              Go to dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="rounded-2xl bg-confident px-6 py-3.5 font-display text-base font-semibold text-black transition hover:opacity-90"
              >
                Start studying →
              </Link>
              <Link
                href="/sign-in"
                className="rounded-2xl border border-border bg-card px-6 py-3.5 font-display text-base font-semibold transition hover:border-foreground/40"
              >
                I already have an account
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-16">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Fact value="128" label="Official questions" />
          <Fact value="Up to 20" label="Asked by the officer" />
          <Fact value="12+" label="To pass" />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-20">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">
            65/20 Rule
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            65+ and a permanent resident for 20+ years?
          </h2>
          <p className="mt-3 text-muted">
            You only have to study the 20 starred questions. The officer asks
            10, and you need 6 right to pass. The app has a dedicated 65/20
            study mode.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-24">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          How it works
        </h2>
        <ol className="mt-5 space-y-4 text-muted">
          <Step n={1} title="See the question.">
            We show one civics question at a time, big and clear, exactly the
            way a USCIS officer would ask it.
          </Step>
          <Step n={2} title="Think your answer out loud.">
            Optionally tap the speaker to hear it. The real test is oral, so
            practice that way.
          </Step>
          <Step n={3} title="Reveal and self-mark.">
            Got it? Tap green. Need more practice? Tap amber. Your progress is
            saved automatically.
          </Step>
          <Step n={4} title="Take a mock test.">
            20 random questions, oral-style, pass/fail at the end — just like
            the real thing.
          </Step>
        </ol>
      </section>

      <footer className="mx-auto max-w-3xl px-5 pb-12 text-xs text-muted">
        Built for studying. Not affiliated with USCIS.
      </footer>
    </main>
  )
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="font-display text-2xl font-semibold text-foreground">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted">
        {label}
      </div>
    </div>
  )
}

function Step({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card font-display text-sm font-semibold text-foreground">
        {n}
      </span>
      <div>
        <p className="font-display text-base font-semibold text-foreground">
          {title}
        </p>
        <p className="mt-1 text-sm text-muted">{children}</p>
      </div>
    </li>
  )
}
