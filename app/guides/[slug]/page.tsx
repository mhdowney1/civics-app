import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GUIDES, getGuide } from '@/lib/guides'
import { ORGANIZATION_ID, SITE_URL, jsonLdScript } from '@/lib/structured-data'

export function generateStaticParams(): Array<{ slug: string }> {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) return {}
  const url = `${SITE_URL}/guides/${guide.slug}`
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      type: 'article',
      url,
      modifiedTime: guide.updated,
    },
  }
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()

  const url = `${SITE_URL}/guides/${guide.slug}`
  const related = GUIDES.filter((g) => g.slug !== guide.slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guide.title,
        description: guide.metaDescription,
        url,
        mainEntityOfPage: url,
        dateModified: guide.updated,
        author: {
          '@type': 'Person',
          name: 'Michael Downey',
          description: 'Passed his own USCIS civics interview in May 2026.',
        },
        publisher: { '@id': ORGANIZATION_ID },
        about: { '@type': 'Thing', name: 'USCIS Naturalization Civics Test' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: guide.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Civics Study', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
          { '@type': 'ListItem', position: 3, name: guide.title, item: url },
        ],
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <main className="mx-auto max-w-2xl px-5 py-12">
        <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
          <Link href="/" className="hover:text-foreground">Civics Study</Link>
          <span>/</span>
          <Link href="/guides" className="hover:text-foreground">Guides</Link>
        </nav>

        <article>
          <header className="mb-6">
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {guide.title}
            </h1>
            <p className="mt-3 text-xs text-muted">
              Last updated{' '}
              <time dateTime={guide.updated}>{formatDate(guide.updated)}</time>
              {' · '}By Michael Downey, who passed his civics interview in May 2026
            </p>
          </header>

          <p className="mb-10 rounded-2xl border border-confident/30 bg-confident/5 p-5 text-base leading-relaxed text-foreground">
            {guide.answer}
          </p>

          {guide.sections.map((section) => (
            <section key={section.heading} className="mb-8">
              <h2 className="mb-3 font-display text-xl font-semibold tracking-tight">
                {section.heading}
              </h2>
              {section.paragraphs?.map((p) => (
                <p key={p} className="mb-3 text-sm leading-relaxed text-muted">{p}</p>
              ))}
              {section.bullets && (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="mb-10">
            <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">
              Common questions
            </h2>
            <dl className="space-y-4">
              {guide.faqs.map((f) => (
                <div key={f.q} className="rounded-xl border border-border bg-card p-4">
                  <dt className="font-display text-base font-semibold">{f.q}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </article>

        <div className="mb-10 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="font-display font-semibold">Practice the way the real test works</p>
          <p className="mt-1 text-sm text-muted">
            Hear each question, answer out loud, and take mock interviews that stop at 12 correct or 9 wrong.
          </p>
          <Link
            href="/sign-up"
            className="mt-4 inline-block rounded-xl bg-confident px-6 py-3 font-display font-semibold text-black text-sm transition hover:opacity-90"
          >
            Start studying free →
          </Link>
          <p className="mt-3 text-xs text-muted">
            Or{' '}
            <Link href="/civics-questions" className="underline hover:text-foreground">
              browse all 128 questions
            </Link>
            .
          </p>
        </div>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">More guides</h2>
          <ul className="space-y-2">
            {related.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="block rounded-xl border border-border bg-card px-4 py-3 text-sm transition hover:border-confident/40"
                >
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 text-xs text-muted">
          Civics Study is an independent study tool and is not affiliated with USCIS. For official
          rules, see{' '}
          <a
            href="https://www.uscis.gov/citizenship"
            className="underline hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            uscis.gov
          </a>
          .
        </p>
      </main>
    </>
  )
}
