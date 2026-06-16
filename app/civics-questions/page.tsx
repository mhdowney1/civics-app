import type { Metadata } from 'next'
import Link from 'next/link'
import { QUESTIONS } from '@/lib/questions'
import { CATEGORIES as CATEGORY_LIST } from '@/lib/types'

export const metadata: Metadata = {
  title: 'All 128 USCIS Civics Questions — US Civics Study',
  description:
    'Browse all 128 official USCIS civics questions for the US naturalization interview. Organized by category with accepted answers.',
  alternates: { canonical: '/civics-questions' },
  openGraph: {
    title: 'All 128 USCIS Civics Questions',
    description:
      'Browse all 128 official USCIS civics questions for the US naturalization interview.',
    url: 'https://civicsstudy.com/civics-questions',
  },
}

export default function CivicsQuestionsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <header className="mb-10">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground"
        >
          ← US Civics Study
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          All 128 USCIS Civics Questions
        </h1>
        <p className="mt-3 text-muted">
          These are the official questions used in the US naturalization interview.
          An officer will ask up to 10 — you need 6 correct to pass.
        </p>
        <Link
          href="/sign-up"
          className="mt-5 inline-block rounded-xl bg-confident px-5 py-3 font-display font-semibold text-black text-sm transition hover:opacity-90"
        >
          Practice all 128 free →
        </Link>
      </header>

      {CATEGORY_LIST.map((category) => {
        const qs = QUESTIONS.filter((q) => q.category === category)
        return (
          <section key={category} className="mb-10">
            <h2 className="mb-4 font-display text-lg font-semibold tracking-tight border-b border-border pb-2">
              {category}
            </h2>
            <ul className="space-y-2">
              {qs.map((q) => (
                <li key={q.id}>
                  <Link
                    href={`/civics-questions/${q.id}`}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm transition hover:border-confident/40"
                  >
                    <span className="shrink-0 text-xs text-muted pt-0.5">#{q.id}</span>
                    <span className="text-foreground leading-snug">{q.question}</span>
                    {q.starred && (
                      <span className="ml-auto shrink-0 text-xs text-confident font-medium">65/20</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <footer className="mt-12 rounded-2xl border border-confident/30 bg-confident/5 p-6 text-center">
        <p className="font-display text-lg font-semibold">Ready to practice?</p>
        <p className="mt-1 text-sm text-muted">
          Free study with progress tracking. Works offline. No subscription.
        </p>
        <Link
          href="/sign-up"
          className="mt-4 inline-block rounded-xl bg-confident px-6 py-3 font-display font-semibold text-black text-sm transition hover:opacity-90"
        >
          Start studying free →
        </Link>
      </footer>
    </main>
  )
}
