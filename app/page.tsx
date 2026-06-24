import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { getTranslations } from 'next-intl/server'
import { CaptureRefParam } from '@/components/share-score'
import { LandingHeader } from '@/components/landing-header'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Civics Study',
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

export default async function LandingPage() {
  const [{ userId }, t] = await Promise.all([
    auth(),
    getTranslations('landing'),
  ])
  const isSignedIn = Boolean(userId)

  const features = [
    { title: t('features.oral.title'), body: t('features.oral.body') },
    { title: t('features.audio.title'), body: t('features.audio.body') },
    { title: t('features.track.title'), body: t('features.track.body') },
    { title: t('features.mock.title'), body: t('features.mock.body') },
  ]

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
  ]

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

      <LandingHeader />

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pb-16 pt-12 sm:pt-20">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          {t('hero.eyebrow')}
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          {t('hero.h1')}{' '}
          <span className="text-confident">{t('hero.h1Accent')}</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          {t('hero.sub')}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="rounded-2xl bg-confident px-6 py-3.5 font-display text-base font-semibold text-black transition hover:opacity-90"
            >
              {t('hero.ctaDashboard')}
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="rounded-2xl bg-confident px-6 py-3.5 font-display text-base font-semibold text-black transition hover:opacity-90"
              >
                {t('hero.ctaSignUp')}
              </Link>
              <Link
                href="/study"
                className="rounded-2xl border border-border bg-card px-6 py-3.5 font-display text-base font-semibold transition hover:border-foreground/40"
              >
                {t('hero.ctaTry')}
              </Link>
            </>
          )}
        </div>
        {!isSignedIn && (
          <p className="mt-4 text-xs text-muted">
            {t('hero.alreadyHave')}{' '}
            <Link
              href="/sign-in"
              className="underline underline-offset-2 hover:text-foreground"
            >
              {t('hero.signIn')}
            </Link>
          </p>
        )}
      </section>

      {/* The problem */}
      <section className="mx-auto max-w-3xl px-5 pb-10 sm:pb-16">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-16">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted">
                {t('problem.mostApps')}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <span className="mt-px shrink-0 text-red-500/60">✕</span>
                  {t('problem.bad1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-px shrink-0 text-red-500/60">✕</span>
                  {t('problem.bad2')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-px shrink-0 text-red-500/60">✕</span>
                  {t('problem.bad3')}
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-confident">
                {t('problem.yourInterview')}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-px shrink-0 text-confident">✓</span>
                  {t('problem.good1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-px shrink-0 text-confident">✓</span>
                  {t('problem.good2')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-px shrink-0 text-confident">✓</span>
                  {t('problem.good3')}
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-6 border-t border-border pt-5 text-sm font-medium text-foreground">
            {t('problem.conclusion')}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-3xl px-5 pb-10 sm:pb-16">
        <div className="grid grid-cols-3 gap-3">
          <Fact value={t('stats.value1')} label={t('stats.label1')} />
          <Fact value={t('stats.value2')} label={t('stats.label2')} />
          <Fact value={t('stats.value3')} label={t('stats.label3')} />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-3xl px-5 pb-12 sm:pb-20">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          {t('howItWorks.eyebrow')}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t('howItWorks.h2')}
        </h2>
        <ol className="mt-8 space-y-4 text-muted">
          <Step n={1} title={t('howItWorks.step1Title')}>
            {t('howItWorks.step1Body')}
          </Step>
          <Step n={2} title={t('howItWorks.step2Title')}>
            {t('howItWorks.step2Body')}
          </Step>
          <Step n={3} title={t('howItWorks.step3Title')}>
            {t('howItWorks.step3Body')}
          </Step>
          <Step n={4} title={t('howItWorks.step4Title')}>
            {t('howItWorks.step4Body')}
          </Step>
        </ol>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-3xl px-5 pb-12 sm:pb-20">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          {t('features.eyebrow')}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t('features.h2')}
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {features.map((f) => (
            <FeatureCard key={f.title} title={f.title} body={f.body} />
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-3xl px-5 pb-12 sm:pb-20">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          {t('pricing.eyebrow')}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t('pricing.h2')}
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Free tier */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{t('pricing.free.label')}</p>
            <p className="mt-3 font-display text-4xl font-semibold tracking-tight">{t('pricing.free.price')}</p>
            <p className="mt-1 text-sm text-muted">{t('pricing.free.sub')}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {(['feature1', 'feature2', 'feature3', 'feature4'] as const).map((k) => (
                <li key={k} className="flex items-center gap-3">
                  <span className="text-confident">✓</span>
                  <span className="text-muted">{t(`pricing.free.${k}`)}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/study"
              className="mt-8 block rounded-2xl border border-border px-6 py-3.5 text-center font-display text-base font-semibold transition hover:border-foreground/40"
            >
              {t('pricing.free.cta')}
            </Link>
          </div>

          {/* Paid tier */}
          <div className="rounded-3xl border border-confident/40 bg-confident/5 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-confident">{t('pricing.paid.label')}</p>
            <p className="mt-3 font-display text-4xl font-semibold tracking-tight">{t('pricing.paid.price')}</p>
            <p className="mt-1 text-sm text-muted">{t('pricing.paid.sub')}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {(['feature1', 'feature2', 'feature3', 'feature4'] as const).map((k) => (
                <li key={k} className="flex items-center gap-3">
                  <span className="text-confident">✓</span>
                  <span>{t(`pricing.paid.${k}`)}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="mt-8 block rounded-2xl bg-confident px-6 py-3.5 text-center font-display text-base font-semibold text-black transition hover:opacity-90"
            >
              {t('pricing.paid.cta')}
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted">
          {t('pricing.footnote')}
        </p>
      </section>

      {/* 65/20 */}
      <section className="mx-auto max-w-3xl px-5 pb-12 sm:pb-20">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">
            {t('rule6520.eyebrow')}
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {t('rule6520.h2')}
          </h2>
          <p className="mt-3 text-muted">
            {t('rule6520.body')}
          </p>
        </div>
      </section>

      {/* Founder story */}
      <section className="mx-auto max-w-3xl px-5 pb-12 sm:pb-20">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <Image src="/michael.jpg" alt="Michael Downey" width={56} height={56} className="rounded-full shrink-0" />
            <div>
              <p className="font-display text-base font-semibold leading-tight">
                {t('founder.name')}
              </p>
              <p className="text-xs text-muted">{t('founder.role')}</p>
            </div>
          </div>
          <blockquote className="mt-5 leading-relaxed text-muted">
            &ldquo;{t('founder.quote')}&rdquo;
          </blockquote>
        </div>
      </section>

      {/* Testimonials — add this section once you have real quotes from users */}

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 pb-12 sm:pb-20">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">
          {t('faq.eyebrow')}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t('faq.h2')}
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
              {t('cta.h2')}
            </h2>
            <p className="mt-3 text-muted">
              {t('cta.sub')}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Link
                href="/sign-up"
                className="rounded-2xl bg-confident px-8 py-4 font-display text-base font-semibold text-black transition hover:opacity-90"
              >
                {t('cta.signUp')}
              </Link>
              <Link
                href="/study"
                className="text-sm text-muted underline underline-offset-2 hover:text-foreground"
              >
                {t('cta.try')}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mx-auto max-w-3xl px-5 pb-12 text-xs text-muted">
        <span>{t('footer.disclaimer')}</span>
        <span className="mx-2">·</span>
        <span>
          {t('footer.builtBy')}{' '}
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
      <div className="font-display text-xl font-semibold text-foreground sm:text-2xl">
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
