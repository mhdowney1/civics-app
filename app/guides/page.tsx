import type { Metadata } from 'next'
import Link from 'next/link'
import { GUIDES, SITE_TAGLINE } from '@/lib/guides'
import { SITE_URL, jsonLdScript } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Citizenship Civics Test Guides (2025 Test) | Civics Study',
  description:
    'Plain-English guides to the oral USCIS civics test: how to practice, what changed in 2025, scoring, the 65/20 rule and re-tests.',
  alternates: { canonical: '/guides' },
  openGraph: {
    title: 'Citizenship Civics Test Guides',
    description: 'Plain-English guides to the oral USCIS civics test.',
    url: `${SITE_URL}/guides`,
  },
}

export default function GuidesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Citizenship Civics Test Guides',
    url: `${SITE_URL}/guides`,
    hasPart: GUIDES.map((g) => ({
      '@type': 'Article',
      headline: g.title,
      url: `${SITE_URL}/guides/${g.slug}`,
      dateModified: g.updated,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <main className="mx-auto max-w-2xl px-5 py-12">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground"
        >
          ← Civics Study
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Civics test guides
        </h1>
        <p className="mt-3 text-muted">
          {SITE_TAGLINE} These guides answer the questions people ask most about the oral civics
          test at the naturalization interview.
        </p>

        <ul className="mt-8 space-y-3">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="block rounded-2xl border border-border bg-card p-5 transition hover:border-confident/40"
              >
                <span className="font-display text-base font-semibold text-foreground">{g.title}</span>
                <span className="mt-1 block text-sm text-muted">{g.metaDescription}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-muted">
          Looking for the questions themselves?{' '}
          <Link href="/civics-questions" className="underline hover:text-foreground">
            Browse all 128 official civics questions
          </Link>
          .
        </p>
      </main>
    </>
  )
}
