import type { Metadata } from 'next'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ score?: string; total?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { score = '0', total = '20' } = await searchParams
  const s = parseInt(score, 10)
  const t = parseInt(total, 10)
  const passed = s >= Math.ceil(t * 0.6)
  const title = `I scored ${s}/${t} on the US Civics Test — ${passed ? 'Pass' : 'Fail'}`
  const ogImage = `https://civicsstudy.com/api/og/result?score=${s}&total=${t}`

  return {
    title,
    description: 'Practice for the USCIS citizenship civics test. 128 official questions, oral-style, free to start.',
    openGraph: {
      title,
      description: 'Think you can beat this? Practice free at civicsstudy.com',
      images: [{ url: ogImage, width: 1200, height: 630 }],
      url: `https://civicsstudy.com/results?score=${s}&total=${t}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: 'Think you can beat this? Practice free at civicsstudy.com',
      images: [ogImage],
    },
  }
}

export default async function ResultsPage({ searchParams }: Props) {
  const { score = '0', total = '20' } = await searchParams
  const s = parseInt(score, 10)
  const t = parseInt(total, 10)
  const passed = s >= Math.ceil(t * 0.6)
  const passThreshold = Math.ceil(t * 0.6)

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 py-12">
      <Link
        href="/"
        className="mb-8 text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground"
      >
        ● US Civics Study
      </Link>

      <div className="w-full rounded-3xl border border-border bg-card p-8 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Mock test result</p>
        <p className="mt-4 font-display text-7xl font-semibold tracking-tight">
          {s}
          <span className="text-muted">/{t}</span>
        </p>
        <p
          className={`mt-3 font-display text-xl font-semibold ${
            passed ? 'text-confident' : 'text-needs-practice'
          }`}
        >
          {passed ? '✓ Pass' : '✗ Fail'}
        </p>
        <p className="mt-1 text-sm text-muted">
          Pass requires {passThreshold} out of {t} correct.
        </p>
      </div>

      <div className="mt-6 w-full space-y-3">
        <Link
          href="/sign-up"
          className="block w-full rounded-2xl bg-confident px-5 py-4 text-center font-display font-semibold text-black transition hover:opacity-90"
        >
          Practice free — all 128 questions →
        </Link>
        <Link
          href="/sign-in"
          className="block w-full rounded-2xl border border-border bg-card px-5 py-4 text-center font-display font-semibold text-muted transition hover:border-confident/40 hover:text-foreground"
        >
          I already have an account
        </Link>
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Oral-style practice · 128 official USCIS questions · Free to start
      </p>
    </main>
  )
}
