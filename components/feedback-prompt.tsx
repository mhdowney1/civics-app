'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics'

export function FeedbackPrompt({ trigger }: { trigger: 'mock_test' | 'all_128' }) {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  if (submitted) {
    return (
      <p className="mt-6 text-center text-sm text-muted">Thanks for the feedback.</p>
    )
  }

  function submit() {
    if (!rating) return
    track('user_feedback_submitted', {
      rating,
      comment: comment.trim() || undefined,
      trigger,
    })
    setSubmitted(true)
  }

  return (
    <div className="mt-6 w-full rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-semibold">How did it go?</p>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-muted hover:text-foreground"
        >
          Skip
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            aria-label={`Rate ${n} out of 5`}
            className={`flex h-10 w-10 items-center justify-center rounded-xl font-display text-sm font-semibold transition ${
              rating === n
                ? 'bg-confident/20 text-confident ring-1 ring-confident/40'
                : 'border border-border bg-background text-muted hover:border-foreground/30 hover:text-foreground'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What would make it better? (optional)"
        rows={2}
        className="mt-3 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-confident/40"
      />
      <button
        onClick={submit}
        disabled={!rating}
        className="mt-3 rounded-xl bg-confident px-4 py-2 text-xs font-semibold text-black transition hover:opacity-90 disabled:opacity-40"
      >
        Send feedback
      </button>
    </div>
  )
}
