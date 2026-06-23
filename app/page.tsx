import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { CaptureRefParam } from '@/components/share-score'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'US Civics Study',
      url: 'https://civicsstudy.com',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Oral-style practice for the 2026 USCIS naturalization civics test. 128 official questions, mock interview, audio playback, and progress tracking.',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How many questions are on the USCIS civics test?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'There are 128 official USCIS civics questions. During your naturalization interview, the officer will ask up to 20 of them.',
          },
        },
        {
          '@type': 'Question',
          name: 'How many questions do I need to answer correctly to pass?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You need to answer 12 out of 20 questions correctly to pass the civics test during your naturalization interview.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the 65/20 rule for the citizenship test?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'If you are 65 years or older and have been a lawful permanent resident for 20 or more years, you only need to study 20 specially marked civics questions. The officer asks 10, and you need 6 correct to pass.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is the USCIS civics test oral or written?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The USCIS civics test is oral. A USCIS officer asks you questions and you answer them out loud. This app is designed to practice the oral format — one question at a time, no multiple choice.',
          },
        },
      ],
    },
    {
      '@type': 'Person',
      name: 'Michael Downey',
      url: 'https://vampcreatives.com',
      description:
        'Built this app while studying for his own USCIS naturalization interview. Passed 12/12 on May 20, 2026.',
    },
  ],
}

const features = [
  {
    title: 'Oral format, not multiple choice',
    body: 'See the question, say your answer out loud, then check yourself. No options to tap. This is how the real interview works.',
  },
  {
    title: 'Hear the question spoken',
    body: 'Tap the speaker on any question to hear it read aloud. Train your ear for the exact phrasing a USCIS officer uses.',
  },
  {
    title: 'Track what you know',
    body: 'Mark each answer confident or needs practice. Your progress is saved and synced so you always know where you stand.',
  },
  {
    title: 'Mock interview',
    body: '20 random questions, oral-style, with a pass/fail result at the end — the same format as your naturalization interview.',
  },
]

const faqs = [
  {
    q: 'How many questions are on the USCIS civics test?',
    a: 'There are 128 official USCIS civics questions. During your naturalization interview, the officer will ask up to 20 of them.',
  },
  {
    q: 'How many do I need to get right to pass?',
    a: 'You need to answer 12 out of 20 questions correctly to pass.',
  },
  {
    q: 'Is the civics test oral or written?',
    a: 'It is oral. A USCIS officer asks you questions and you answer out loud. There are no multiple choice options.',
  },
  {
    q: 'What is the 65/20 rule?',
    a: 'If you are 65 or older and have been a permanent resident for 20+ years, you only need to study 20 specially marked questions. The officer asks 10, and you need 6 correct to pass. The app has a dedicated mode for this.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. You can try the app without an account. Creating a free account lets you save your progress and track which questions you have mastered.',
  },
]

export default async function LandingPage() {
  const { userId } = await auth()
  const isSignedIn = Boolean(userId)

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <CaptureRefParam />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[80vh] opacity-60"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(74,222,128,0.18) 0%, rgba(15,15,15,0) 70%)',
        }}
      />

      {/* Header */}
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
                Sign up free
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pb-16 pt-12 sm:pt-20">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          2026 USCIS Naturalization Test
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          The civics test is oral.{' '}
          <span className="text-confident">Practice like it.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          All 128 official questions, one at a time — no multiple choice, no
          clutter. Say your answer out loud, then check yourself. Free to start,
          no subscription ever.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
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
                Start studying — it&apos;s free →
              </Link>
              <Link
                href="/study"
                className="rounded-2xl border border-border bg-card px-6 py-3.5 font-display text-base font-semibold transition hover:border-foreground/40"
              >
                Try without an account
              </Link>
            </>
          )}
        </div>
        {!isSignedIn && (
          <p className="mt-4 text-xs text-muted">
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Sign in
            </Link>
          </p>
        )}
      </section>

      {/* The problem */}
      <section className="mx-auto max-w-3xl px-5 pb-16">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-6 sm:gap-16">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted">
                Most apps
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <span className="mt-px shrink-0 text-red-500/60">✕</span>
                  Multiple choice options
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-px shrink-0 text-red-500/60">✕</span>
                  Tap to select an answer
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-px shrink-0 text-red-500/60">✕</span>
                  Nothing like the real test
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-confident">
                Your USCIS interview
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-px shrink-0 text-confident">✓</span>
                  Officer asks a question
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-px shrink-0 text-confident">✓</span>
                  You answer out loud
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-px shrink-0 text-confident">✓</span>
                  No options. No hints.
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-6 border-t border-border pt-5 text-sm font-medium text-foreground">
            This app is built for the second column.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-3xl px-5 pb-16">
        <div className="grid grid-cols-3 gap-3">
          <Fact value="128" label="Official questions" />
          <Fact value="Up to 20" label="Asked by the officer" />
          <Fact value="12 / 20" label="Needed to pass" />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-3xl px-5 pb-20">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          How it works
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Four steps. Just like the real interview.
        </h2>
        <ol className="mt-8 space-y-4 text-muted">
          <Step n={1} title="See the question.">
            One civics question at a time, big and clear — exactly the way a
            USCIS officer reads it.
          </Step>
          <Step n={2} title="Say your answer out loud.">
            No options to tap. Speak your answer — or tap the speaker to hear
            the question first. The real test is oral, so practice that way.
          </Step>
          <Step n={3} title="Reveal and self-mark.">
            Tap to reveal the answer. Got it? Mark it confident. Still shaky?
            Mark it needs practice. Your progress is saved automatically.
          </Step>
          <Step n={4} title="Take a mock interview.">
            20 random questions, oral-style, with a pass/fail result at the end
            — the same format as your naturalization interview.
          </Step>
        </ol>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-3xl px-5 pb-20">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          Features
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Built around the real exam format.
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {features.map((f) => (
            <FeatureCard key={f.title} title={f.title} body={f.body} />
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-3xl px-5 pb-20">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          Pricing
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Free to study. One-time to unlock.
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Free tier */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Free</p>
            <p className="mt-3 font-display text-4xl font-semibold tracking-tight">$0</p>
            <p className="mt-1 text-sm text-muted">No account required</p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                'All 128 official USCIS questions',
                'Oral study mode',
                '1 free mock test',
                'Spanish language support',
              ].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="text-confident">✓</span>
                  <span className="text-muted">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/study"
              className="mt-8 block rounded-2xl border border-border px-6 py-3.5 text-center font-display text-base font-semibold transition hover:border-foreground/40"
            >
              Start studying free
            </Link>
          </div>

          {/* Paid tier */}
          <div className="rounded-3xl border border-confident/40 bg-confident/5 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-confident">Unlock</p>
            <p className="mt-3 font-display text-4xl font-semibold tracking-tight">$12.99</p>
            <p className="mt-1 text-sm text-muted">One-time · not a subscription</p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                'Everything in free',
                'Unlimited mock tests',
                'Detailed progress analytics',
                'Works offline',
              ].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="text-confident">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="mt-8 block rounded-2xl bg-confident px-6 py-3.5 text-center font-display text-base font-semibold text-black transition hover:opacity-90"
            >
              Get started →
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted">
          Citizenry charges $10 / month for the same thing. You pay once here and you&apos;re done.
        </p>
      </section>

      {/* 65/20 */}
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

      {/* Founder story */}
      <section className="mx-auto max-w-3xl px-5 pb-20">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <Image src="/michael.jpg" alt="Michael Downey" width={56} height={56} className="rounded-full shrink-0" />
            <div>
              <p className="font-display text-base font-semibold leading-tight">
                Michael Downey
              </p>
              <p className="text-xs text-muted">Creator, CivicsStudy.com</p>
            </div>
          </div>
          <blockquote className="mt-5 leading-relaxed text-muted">
            &ldquo;In April 2026 I was studying for my own citizenship
            interview. Every app I downloaded was multiple choice — that&apos;s
            not how the test works. I found a YouTube channel where someone
            would ask the question, pause, then give the answer. That was the
            closest thing to real oral practice I could find. So I built
            something better. I passed 12 out of 12 on May 20.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* Testimonials — add this section once you have real quotes from users */}

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 pb-20">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          Common questions
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          FAQ
        </h2>
        <dl className="mt-8 space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <dt className="font-display text-base font-semibold">{faq.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">
                {faq.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Final CTA */}
      {!isSignedIn && (
        <section className="mx-auto max-w-3xl px-5 pb-24">
          <div className="rounded-3xl border border-confident/30 bg-confident/5 p-8 text-center sm:p-12">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to practice?
            </h2>
            <p className="mt-3 text-muted">
              Start free. Unlock unlimited mock tests for $12.99 — one time, no subscription.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Link
                href="/sign-up"
                className="rounded-2xl bg-confident px-8 py-4 font-display text-base font-semibold text-black transition hover:opacity-90"
              >
                Start studying — it&apos;s free →
              </Link>
              <Link
                href="/study"
                className="text-sm text-muted underline underline-offset-2 hover:text-foreground"
              >
                Try without an account
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mx-auto max-w-3xl px-5 pb-12 text-xs text-muted">
        <span>Built for studying. Not affiliated with USCIS.</span>
        <span className="mx-2">·</span>
        <span>
          Built by{' '}
          <a
            href="https://vampcreatives.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Vamp Creatives
          </a>
        </span>
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

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="h-1 w-8 rounded-full bg-confident" />
      <p className="mt-4 font-display text-base font-semibold">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  )
}
