'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { getCategoryName } from '@/lib/category-names'
import { DashboardConfetti } from '@/components/dashboard-confetti'
import { ProcessReferral } from '@/components/share-score'
import { StreakBadge } from '@/components/streak-badge'
import type { TestRun } from '@/lib/server-tests'
import type { StreakResult } from '@/lib/server-streak'
import { InterviewCountdown } from '@/components/interview-countdown'

interface Category {
  name: string
  total: number
  confident: number
}

interface DashboardUIProps {
  firstName: string
  studied: number
  confident: number
  needsPractice: number
  unseen: number
  weakCount: number
  paid: boolean
  paidParam: boolean
  recentTests: TestRun[]
  totalQuestions: number
  starredCount: number
  categories: Category[]
  streak: StreakResult['streak']
  lastStudied: StreakResult['lastStudied']
  interviewDate: string | null
}

export function DashboardUI({
  firstName,
  studied,
  confident,
  needsPractice,
  unseen,
  weakCount,
  paid,
  paidParam,
  recentTests,
  totalQuestions,
  starredCount,
  categories,
  streak,
  lastStudied,
  interviewDate,
}: DashboardUIProps) {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <DashboardConfetti confident={confident} paid={paidParam} />
      <ProcessReferral />
      <div className="mb-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm uppercase tracking-[0.18em] text-muted">
              {studied === 0 ? t('welcome') : t('welcomeBack')}
            </p>
            {paid && (
              <span className="inline-flex items-center gap-1 rounded-full border border-confident/30 bg-confident/10 px-2.5 py-0.5 text-xs font-medium text-confident">
                {t('fullAccess')}
              </span>
            )}
          </div>
        </div>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {t('greeting', { firstName })}
        </h1>
        <p className="mt-3 text-muted">
          {t('progressText', { studied, total: totalQuestions })}
        </p>
        <StreakBadge streak={streak} lastStudied={lastStudied} />
      </div>

      <InterviewCountdown
        interviewDate={interviewDate}
        confident={confident}
        needsPractice={needsPractice}
        totalQuestions={totalQuestions}
      />

      {studied === 0 && <OnboardingCard t={t} />}

      <section className="mb-10 grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label={t('confident')} value={confident} color="text-confident" />
        <Stat label={t('needsPractice')} value={needsPractice} color="text-needs-practice" />
        <Stat label={t('notStudied')} value={unseen} color="text-unseen" />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-xl font-semibold">{t('studyModes')}</h2>
        <div className="flex flex-col gap-4">
          <StudyCard
            href="/study"
            title={t('allQuestionsTitle')}
            description={t('allQuestionsDesc')}
            badge={t('questionsCount', { n: totalQuestions })}
          />
          <StudyCard
            href="/study?mode=starred"
            title={t('starredTitle')}
            description={t('starredDesc')}
            badge={t('questionsCount', { n: starredCount })}
          />
          <StudyCard
            href="/study?mode=weak"
            title={t('needsPracticeTitle')}
            description={t('needsPracticeDesc')}
            badge={t('questionsCount', { n: weakCount })}
            disabled={weakCount === 0}
          />
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-3 font-display text-lg font-semibold">{t('byCategory')}</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {categories.map(({ name, total, confident }) => (
            <Link
              key={name}
              href={`/study?category=${encodeURIComponent(name)}`}
              className="group rounded-xl border border-border bg-card px-4 py-3 transition hover:border-confident/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{getCategoryName(name, locale)}</span>
                <span className="text-xs text-muted group-hover:text-foreground">
                  {confident}/{total}
                </span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-confident transition-all duration-300"
                  style={{ width: total > 0 ? `${Math.round((confident / total) * 100)}%` : '0%' }}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <Link
          href="/test"
          className="flex w-full items-center justify-center rounded-2xl border border-confident/40 bg-confident/10 px-6 py-5 font-display text-lg font-semibold text-confident transition hover:bg-confident/15"
        >
          {t('startMockTest')}
        </Link>
        <p className="mt-2 text-center text-xs text-muted">
          {t('mockTestDesc')}
        </p>

        {recentTests.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
                {t('recentTests')}
              </h3>
              <Link
                href="/test/history"
                className="text-xs text-muted hover:text-foreground"
              >
                {t('viewAll')}
              </Link>
            </div>
            <ul className="space-y-2">
              {recentTests.map((run) => (
                <TestRunRow key={run.id} run={run} pass={t('pass')} fail={t('fail')} />
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-5 text-center">
      <div className={`font-display text-3xl font-semibold ${color}`}>{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted">{label}</div>
    </div>
  )
}

function TestRunRow({ run, pass, fail }: { run: TestRun; pass: string; fail: string }) {
  const locale = useLocale()
  const date = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(run.takenAt))

  return (
    <li className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
      <span className="text-sm text-muted">{date}</span>
      <span className="font-display text-sm font-semibold">
        {run.score} / {run.total}
      </span>
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
          run.passed
            ? 'bg-confident/10 text-confident'
            : 'bg-needs-practice/10 text-needs-practice'
        }`}
      >
        {run.passed ? pass : fail}
      </span>
    </li>
  )
}

function StudyCard({
  href,
  title,
  description,
  badge,
  disabled,
}: {
  href: string
  title: string
  description: string
  badge: string
  disabled?: boolean
}) {
  const content = (
    <div
      className={`flex items-center justify-between rounded-2xl border bg-card px-5 py-4 transition ${
        disabled
          ? 'cursor-not-allowed border-border opacity-50'
          : 'border-border hover:border-confident/40'
      }`}
    >
      <div className="min-w-0 pr-4">
        <div className="font-display text-base font-semibold">{title}</div>
        <div className="mt-1 text-sm text-muted">{description}</div>
      </div>
      <span className="shrink-0 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted">
        {badge}
      </span>
    </div>
  )
  if (disabled) return content
  return <Link href={href}>{content}</Link>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OnboardingCard({ t }: { t: (key: string) => string }) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('civics:onboarding-dismissed') === '1'
  })

  if (dismissed) return null

  return (
    <div className="mb-8 rounded-2xl border border-confident/30 bg-confident/5 p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="font-display text-base font-semibold">{t('onboardingTitle')}</p>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem('civics:onboarding-dismissed', '1')
            setDismissed(true)
          }}
          className="shrink-0 text-sm text-muted hover:text-foreground"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <ol className="space-y-2 text-sm text-muted">
        {([1, 2, 3] as const).map((n) => (
          <li key={n} className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-confident/40 text-xs font-semibold text-confident">
              {n}
            </span>
            <span>{t(`onboardingStep${n}` as 'onboardingStep1')}</span>
          </li>
        ))}
      </ol>
      <Link
        href="/study"
        className="mt-4 inline-block rounded-xl bg-confident/10 px-4 py-2 text-sm font-semibold text-confident ring-1 ring-confident/30 transition hover:bg-confident/15"
      >
        {t('onboardingCta')}
      </Link>
    </div>
  )
}
