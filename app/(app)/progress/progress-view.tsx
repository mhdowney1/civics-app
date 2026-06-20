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

  const categoryStats = useMemo(() => {
    return CATEGORIES.map((c) => {
      const qs = questions.filter((q) => q.category === c)
      const confident = qs.filter((q) => byId.get(q.id)?.status === 'confident').length
      const practice = qs.filter((q) => byId.get(q.id)?.status === 'needs_practice').length
      return { name: c, total: qs.length, confident, practice }
    })
  }, [byId, questions])

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

      {/* Category overview bars */}
      <section className="mb-8">
        <h2 className="mb-3 font-display text-base font-semibold">{t('byCategory')}</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {categoryStats.map(({ name, total, confident, practice }) => (
            <button
              key={name}
              onClick={() => setCategoryFilter(categoryFilter === name ? 'all' : name as CategoryFilter)}
              className={`group rounded-xl border bg-card px-4 py-3 text-left transition ${
                categoryFilter === name
                  ? 'border-confident/60 bg-confident/5'
                  : 'border-border hover:border-confident/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{getCategoryName(name, locale)}</span>
                <span className="text-xs text-muted">{confident}/{total}</span>
              </div>
              <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-l-full bg-confident transition-all"
                  style={{ width: total > 0 ? `${Math.round((confident / total) * 100)}%` : '0%' }}
                />
                <div
                  className="h-full bg-needs-practice/60 transition-all"
                  style={{ width: total > 0 ? `${Math.round((practice / total) * 100)}%` : '0%' }}
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="mb-6 flex flex-col gap-4">
        <div>
          <span className="block text-xs uppercase tracking-wider text-muted mb-2">
            {t('categoryLabel')}
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm sm:w-auto"
          >
            <option value="all">{t('allCategories')}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {getCategoryName(c, locale)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wider text-muted mb-2">
            {t('statusLabel')}
          </span>
          <div className="flex flex-wrap gap-2">
            {(['all', 'confident', 'needs_practice', 'unseen'] as const).map((s) => {
              const label = s === 'all' ? t('allStatuses') : s === 'confident' ? t('confident') : s === 'needs_practice' ? t('needsPractice') : t('notStudied')
              const active = statusFilter === s
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? s === 'confident'
                        ? 'border-confident bg-confident/10 text-confident'
                        : s === 'needs_practice'
                          ? 'border-needs-practice bg-needs-practice/10 text-needs-practice'
                          : s === 'unseen'
                            ? 'border-unseen bg-unseen/10 text-unseen'
                            : 'border-foreground bg-foreground/10 text-foreground'
                      : 'border-border text-muted hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
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
