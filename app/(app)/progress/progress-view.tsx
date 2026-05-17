'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES, type CategoryName, type ProgressRecord, type Question, type Status } from '@/lib/types'
import { resetProgress } from '@/lib/progress-client'

type StatusFilter = 'all' | Status
type CategoryFilter = 'all' | CategoryName

const STATUS_META: Record<Status, { label: string; dot: string; text: string }> = {
  confident: { label: 'Confident', dot: 'bg-confident', text: 'text-confident' },
  needs_practice: {
    label: 'Needs practice',
    dot: 'bg-needs-practice',
    text: 'text-needs-practice',
  },
  unseen: { label: 'Not studied', dot: 'bg-unseen', text: 'text-unseen' },
}

export function ProgressView({
  questions,
  initialProgress,
}: {
  questions: Question[]
  initialProgress: ProgressRecord[]
}) {
  const router = useRouter()
  const [resetting, setResetting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

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
    const t = { confident: 0, needs_practice: 0, unseen: 0 }
    for (const q of questions) {
      const s = (byId.get(q.id)?.status ?? 'unseen') as Status
      t[s] += 1
    }
    return t
  }, [byId, questions])

  async function handleReset() {
    setResetting(true)
    try {
      await resetProgress()
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
            Your progress
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            128 questions
          </h1>
          <p className="mt-1 text-sm text-muted">
            {totals.confident} confident · {totals.needs_practice} need
            practice · {totals.unseen} not studied
          </p>
        </div>
        <button
          onClick={() => setConfirming(true)}
          className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:border-needs-practice/40 hover:text-needs-practice"
        >
          Reset
        </button>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="block text-xs uppercase tracking-wider text-muted">
            Category
          </span>
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as CategoryFilter)
            }
            className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-wider text-muted">
            Status
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="confident">Confident</option>
            <option value="needs_practice">Needs practice</option>
            <option value="unseen">Not studied</option>
          </select>
        </label>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            No questions match these filters.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map(({ question, status }) => {
              const meta = STATUS_META[status]
              return (
                <li
                  key={question.id}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  <span
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span>#{question.id}</span>
                      <span>·</span>
                      <span className="truncate">{question.category}</span>
                      {question.starred && (
                        <span className="text-needs-practice">★</span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-sm text-foreground">
                      {question.question}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs uppercase tracking-wider ${meta.text}`}
                  >
                    {meta.label}
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
              Reset all progress?
            </h2>
            <p className="mt-2 text-sm text-muted">
              This clears your study history for all 128 questions. You can&apos;t
              undo this.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
                disabled={resetting}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex-1 rounded-xl bg-needs-practice/15 px-4 py-2.5 text-sm font-semibold text-needs-practice ring-1 ring-needs-practice/30 disabled:opacity-60"
              >
                {resetting ? 'Resetting…' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
