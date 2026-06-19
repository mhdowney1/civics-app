'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { track } from '@/lib/analytics'

type Trigger = 'mock_test' | 'all_128' | 'session_end'

export function FeedbackPrompt({ trigger }: { trigger: Trigger }) {
  const t = useTranslations('feedback')
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  if (submitted) {
    return (
      <p className="mt-6 text-center text-sm text-muted">{t('thanks')}</p>
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

  const titleKey = trigger === 'mock_test' ? 'titleMockTest' : trigger === 'all_128' ? 'titleAll128' : 'titleSessionEnd'
  const placeholderKey = trigger === 'mock_test' ? 'placeholderMockTest' : trigger === 'all_128' ? 'placeholderAll128' : 'placeholderSessionEnd'

  return (
    <div className="mt-6 w-full rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-semibold">{t(titleKey)}</p>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-muted hover:text-foreground"
        >
          {t('skip')}
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            aria-label={t('rateAria', { n })}
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
        placeholder={t(placeholderKey)}
        rows={2}
        className="mt-3 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-confident/40"
      />
      <button
        onClick={submit}
        disabled={!rating}
        className="mt-3 rounded-xl bg-confident px-4 py-2 text-xs font-semibold text-black transition hover:opacity-90 disabled:opacity-40"
      >
        {t('send')}
      </button>
    </div>
  )
}
