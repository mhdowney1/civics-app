'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useTranslations, useLocale } from 'next-intl'

interface Props {
  interviewDate: string | null
  confident: number
  needsPractice: number
  totalQuestions: number
}

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function readinessLabel(mastery: number, daysLeft: number | null): string {
  if (daysLeft !== null && daysLeft <= 14 && mastery < 0.75) {
    return 'interview-soon'
  }
  if (mastery >= 0.95) return 'ready'
  if (mastery >= 0.85) return 'almost'
  if (mastery >= 0.70) return 'strong'
  if (mastery >= 0.50) return 'momentum'
  if (mastery >= 0.25) return 'foundation'
  return 'starting'
}

export function InterviewCountdown({ interviewDate, confident, needsPractice, totalQuestions }: Props) {
  const t = useTranslations('interview')
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [inputDate, setInputDate] = useState(interviewDate ?? '')
  const [dismissed, setDismissed] = useState(false)

  const mastery = totalQuestions > 0 ? confident / totalQuestions : 0
  const unseen = totalQuestions - confident - needsPractice
  const days = interviewDate ? daysUntil(interviewDate) : null
  const readiness = readinessLabel(mastery, days)
  const masteryPct = Math.round(mastery * 100)
  const practicePct = Math.round((needsPractice / totalQuestions) * 100)

  async function saveDate(date: string | null) {
    await fetch('/api/interview-date', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    })
    setEditing(false)
    startTransition(() => router.refresh())
  }

  // No date set — show subtle prompt (dismissible)
  if (!interviewDate && !editing) {
    if (dismissed) return null
    return (
      <div className="mb-8 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <p className="text-sm text-muted">{t('setDatePrompt')}</p>
        <div className="flex shrink-0 items-center gap-3 pl-3">
          <button
            onClick={() => setEditing(true)}
            className="whitespace-nowrap text-sm font-semibold text-confident hover:underline"
          >
            {t('setDate')}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-xs text-muted hover:text-foreground"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  // Date input form
  if (editing) {
    return (
      <div className="mb-8 rounded-xl border border-border bg-card px-4 py-3">
        <p className="mb-2 text-xs uppercase tracking-wider text-muted">{t('setDateLabel')}</p>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-confident/40"
          />
          <button
            onClick={() => inputDate && saveDate(inputDate)}
            disabled={!inputDate || isPending}
            className="rounded-lg bg-confident/10 px-3 py-1.5 text-sm font-semibold text-confident ring-1 ring-confident/30 transition hover:bg-confident/15 disabled:opacity-40"
          >
            {isPending ? '…' : t('save')}
          </button>
          {interviewDate && (
            <button
              onClick={() => setEditing(false)}
              className="text-xs text-muted hover:text-foreground"
            >
              {t('cancel')}
            </button>
          )}
        </div>
      </div>
    )
  }

  // Date is set — show countdown + readiness
  const isPast = days !== null && days < 0
  const isToday = days === 0

  return (
    <div className="mb-8 rounded-2xl border border-border bg-card p-4 sm:p-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {isPast ? (
            <p className="font-display text-base font-semibold">{t('pastInterview')}</p>
          ) : isToday ? (
            <p className="font-display text-base font-semibold text-confident">{t('interviewToday')}</p>
          ) : (
            <p className="font-display text-base font-semibold">
              {t('daysUntil', { n: days! })}
            </p>
          )}
          <p className="mt-0.5 text-xs text-muted">{formatDate(interviewDate!, locale)}</p>
        </div>
        <button
          onClick={() => { setInputDate(interviewDate ?? ''); setEditing(true) }}
          className="shrink-0 text-xs text-muted hover:text-foreground"
        >
          {t('change')}
        </button>
      </div>

      {/* Progress bar: confident / needs practice / unseen */}
      <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-background">
        <div
          className="h-full bg-confident transition-all"
          style={{ width: `${masteryPct}%` }}
        />
        <div
          className="h-full bg-needs-practice/60 transition-all"
          style={{ width: `${practicePct}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center gap-3 text-xs text-muted">
        <span className="text-confident font-medium">{confident} {t('ready')}</span>
        {needsPractice > 0 && <span>{needsPractice} {t('toReview')}</span>}
        {unseen > 0 && <span>{unseen} {t('unseen')}</span>}
      </div>

      {/* Readiness label */}
      <p className={`mt-3 text-sm font-medium ${readiness === 'ready' ? 'text-confident' : readiness === 'interview-soon' ? 'text-needs-practice' : 'text-foreground'}`}>
        {t(`readiness.${readiness}`)}
      </p>
    </div>
  )
}
