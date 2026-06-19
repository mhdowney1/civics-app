'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { CATEGORIES, type CategoryName, type ProgressRecord, type Question, type Status } from '@/lib/types'
import { resetProgress } from '@/lib/progress-client'
import { track } from '@/lib/analytics'
import { getCategoryName } from '@/lib/category-names'

type StatusFilter = 'all' | Status
type CategoryFilter = 'all' | CategoryName

const STATUS_COLORS: Record<Status, { dot: string; text: string }> = {
  confident: { dot: 'bg-confident', text: 'text-confident' },
  needs_practice: { dot: 'bg-needs-practice', text: 'text-needs-practice' },
  unseen: { dot: 'bg-unseen', text: 'text-unseen' },
}

export function ProgressView({
  questions,
  initialProgress,
}: {
  questions: Question[]
  initialProgress: ProgressRecord[]
}) {
  const t = useTranslations('progress')
  const locale = useLocale()
  const router = useRouter()
  const [resetting, setResetting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const statusLabels: Record<Status, string> = {
    confident: t('confident'),
    needs_practice: t('needsPractice'),
    unseen: t('notStudied'),
  }

  const byId = useMemo(
    () => new Map(initialProgress.map((p) => [p.questionId, p])),
    [initialProgress],
  )

  const rows = useMemo(() => {
    return questions
      .filter((q) =>
        categoryFilter === 'all' ? true : q.category === categoryFilter,
      )
      .map((q) => ({
        question: q,
        status: (byId.get(q.id)?.status ?? 'unseen') as Status,
      }))
      .filter((r) =>
        statusFilter === 'all' ? true : r.status === statusFilter,
      )
  }, [byId, categoryFilter, questions, statusFilter])

  const totals = useMemo(() => {
    const result = { confident: 0, needs_practice: 0, unseen: 0 }
    for (const q of questions) {
      const s = (byId.get(q.id)?.status ?? 'unseen') as Status
      result[s] += 1
    }
    return result
  }, [byId, questions])

  async function handleReset() {
    setResetting(true)
    try {
      await resetProgress()
      track('progress_reset')
      setConfirming(false)
      router.refresh()
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-muted">
            {t('sectionLabel')}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {t('stats', {
              confident: totals.confident,
              practice: totals.needs_practice,
              unseen: totals.unseen,
            })}
          </p>
        </div>
        <button
          onClick={() => setConfirming(true)}
          className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:border-needs-practice/40 hover:text-needs-practice"
        >
          {t('reset')}
        </button>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="block text-xs uppercase tracking-wider text-muted">
            {t('categoryLabel')}
          </span>
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as CategoryFilter)
            }
            className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
          >
            <option value="all">{t('allCategories')}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {getCategoryName(c, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-wider text-muted">
            {t('statusLabel')}
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="confident">{t('confident')}</option>
            <option value="needs_practice">{t('needsPractice')}</option>
            <option value="unseen">{t('notStudied')}</option>
          </select>
        </label>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            {t('noMatch')}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map(({ question, status }) => {
              const colors = STATUS_COLORS[status]
              const questionText = locale === 'es' ? (question.questionEs ?? question.question) : question.question
              return (
                <li
                  key={question.id}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  <span
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${colors.dot}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span>#{question.id}</span>
                      <span>·</span>
                      <span className="truncate">{getCategoryName(question.category, locale)}</span>
                      {question.starred && (
                        <span className="text-needs-practice">★</span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-foreground">
                      {questionText}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs uppercase tracking-wider ${colors.text}`}
                  >
                    {statusLabels[status]}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">
              {t('resetTitle')}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {t('resetDesc')}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                disabled={resetting}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex-1 rounded-xl bg-needs-practice/15 px-4 py-2.5 text-sm font-semibold text-needs-practice ring-1 ring-needs-practice/30 disabled:opacity-60"
              >
                {resetting ? t('resetting') : t('reset')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
