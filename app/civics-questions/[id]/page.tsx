import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { QUESTIONS, getQuestionById } from '@/lib/questions'

export function generateStaticParams(): Array<{ id: string }> {
  return QUESTIONS.map((q) => ({ id: String(q.id) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const question = getQuestionById(parseInt(id, 10))
  if (!question) return {}
  const title = `${question.question} — USCIS Civics Question #${question.id}`
  const description = `Official USCIS answer: ${question.answers.slice(0, 3).join('; ')}. Practice this and all 128 civics questions free at civicsstudy.com.`
  return {
    title,
    description,
    alternates: { canonical: `/civics-questions/${question.id}` },
    openGraph: {
      title,
      description,
      url: `https://civicsstudy.com/civics-questions/${question.id}`,
      images: [
        {
          url: `/civics-questions/${question.id}/opengraph-image`,
          width: 1200,
          height: 630,
        },
      ],
    },
  }
}

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const question = getQuestionById(parseInt(id, 10))
  if (!question) notFound()

  const prevQ = getQuestionById(question.id - 1)
  const nextQ = getQuestionById(question.id + 1)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Question',
    name: question.question,
    acceptedAnswer: question.answers.map((a) => ({
      '@type': 'Answer',
      text: a,
    })),
    about: {
      '@type': 'Thing',
      name: 'USCIS Naturalization Civics Test',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-2xl px-5 py-12">
        <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
          <Link href="/" className="hover:text-foreground">Civics Study</Link>
          <span>/</span>
          <Link href="/civics-questions" className="hover:text-foreground">All Questions</Link>
          <span>/</span>
          <span>#{question.id}</span>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs uppercase tracking-wider text-muted">{question.category}</span>
            {question.starred && (
              <span className="rounded-md bg-confident/10 px-2 py-0.5 text-xs font-semibold text-confident">
                65/20 Rule
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
            {question.question}
          </h1>
          <p className="mt-2 text-xs text-muted">
            USCIS Civics Question #{question.id} of 128
          </p>
        </header>

        <section className="mb-8 rounded-2xl border border-confident/30 bg-confident/5 p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-confident">
            Official Accepted Answer{question.answers.length > 1 ? 's' : ''}
          </h2>
          <ul className="space-y-2">
            {question.answers.map((answer, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-confident/20 bg-card px-4 py-3"
              >
                <span className="mt-0.5 shrink-0 text-confident">✓</span>
                <span className="text-foreground leading-snug">{answer}</span>
              </li>
            ))}
          </ul>
          {question.variable && (
            <p className="mt-4 text-xs text-muted">
              <strong className="text-foreground">Note:</strong> This answer may change as current officials or events change.
              Always verify the current answer at{' '}
              <a
                href="https://www.uscis.gov/citizenship/find-study-materials-and-resources/study-for-the-test"
                className="underline hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                uscis.gov
              </a>
              .
            </p>
          )}
        </section>

        <section className="mb-8 rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-2 font-display font-semibold">About this question</h2>
          <p className="text-sm text-muted leading-relaxed">
            This is one of 128 official civics questions the USCIS may ask during
            the naturalization interview. During the test, the officer will ask up to
            10 questions from this list — you need to answer at least 6 correctly to
            pass.{' '}
            {question.starred && (
              <>
                This question is part of the{' '}
                <strong className="text-foreground">65/20 rule</strong> — if you are
                65 or older and have been a permanent resident for 20+ years, you only
                need to study the 20 starred questions.{' '}
              </>
            )}
            The test is oral: an officer asks the question and you answer out loud, in
            English.
          </p>
        </section>

        <div className="mb-8 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="font-display font-semibold">Practice this question and all 128 others</p>
          <p className="mt-1 text-sm text-muted">
            Oral-style. Progress tracking. Offline. Free to start.
          </p>
          <Link
            href="/sign-up"
            className="mt-4 inline-block rounded-xl bg-confident px-6 py-3 font-display font-semibold text-black text-sm transition hover:opacity-90"
          >
            Start studying free →
          </Link>
        </div>

        <nav className="flex items-center justify-between">
          {prevQ ? (
            <Link
              href={`/civics-questions/${prevQ.id}`}
              className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3 text-sm transition hover:border-confident/40 max-w-[45%]"
            >
              <span className="text-xs text-muted">← Previous</span>
              <span className="font-medium line-clamp-1">{prevQ.question}</span>
            </Link>
          ) : <div />}
          {nextQ ? (
            <Link
              href={`/civics-questions/${nextQ.id}`}
              className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3 text-sm transition hover:border-confident/40 text-right max-w-[45%]"
            >
              <span className="text-xs text-muted">Next →</span>
              <span className="font-medium line-clamp-1">{nextQ.question}</span>
            </Link>
          ) : <div />}
        </nav>
      </main>
    </>
  )
}
