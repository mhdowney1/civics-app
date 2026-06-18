'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { Question, Status } from '@/lib/types'
import { saveProgress } from '@/lib/progress-client'
import { track } from '@/lib/analytics'
import { FeedbackPrompt } from '@/components/feedback-prompt'
import { SpeakerButton } from '@/components/speaker-button'
import { getStoredLocation, setStoredLocation, clearStoredLocation, type LocationData } from '@/lib/location'

interface Props {
  initialQuestions: Question[]
  modeLabel: string
  mode: string
  isSignedIn?: boolean
}

interface SessionResult {
  questionId: number
  status: Status
}

const ADVANCE_MS = 800

export function StudySession({ initialQuestions, modeLabel, mode, isSignedIn = true }: Props) {
  const [questions] = useState(initialQuestions)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState<SessionResult[]>([])
  const [finished, setFinished] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [showAllAnswers, setShowAllAnswers] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('civics:show-all-answers') === 'true'
  })
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggleShowAllAnswers = useCallback(() => {
    setShowAllAnswers((prev) => {
      const next = !prev
      localStorage.setItem('civics:show-all-answers', String(next))
      return next
    })
  }, [])

  const [location, setLocation] = useState<LocationData | null>(() => getStoredLocation())
  const handleLocationSaved = useCallback((data: LocationData) => setLocation(data), [])
  const handleClearLocation = useCallback(() => {
    clearStoredLocation()
    setLocation(null)
  }, [])

  useEffect(() => {
    track('study_session_started', {
      mode,
      count: questions.length,
    })
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const current = questions[index]
  const total = questions.length
  const progressPct = useMemo(
    () => Math.round(((index + (revealed ? 0.5 : 0)) / total) * 100),
    [index, revealed, total],
  )

  const handleAnswer = useCallback(
    (status: Status) => {
      if (!current) return
      void saveProgress(current.id, status)
      track('question_answered', {
        question_id: current.id,
        status,
        category: current.category,
      })
      setResults((r) => [...r, { questionId: current.id, status }])
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
      advanceTimer.current = setTimeout(() => {
        if (index + 1 >= total) {
          const correct = [...results, { questionId: current.id, status }].filter(
            (r) => r.status === 'confident',
          ).length
          track('study_session_completed', {
            mode,
            total,
            correct,
            needs_practice: total - correct,
          })
          setFinished(true)
        } else {
          setIndex((i) => i + 1)
          setRevealed(false)
        }
      }, ADVANCE_MS)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current, index, total],
  )

  if (finished) {
    const correct = results.filter((r) => r.status === 'confident').length
    return <SessionSummary correct={correct} total={results.length} isSignedIn={isSignedIn} />
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12 text-center text-muted">
        No questions in this session.
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-64px)] max-w-2xl flex-col px-5 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pt-10 sm:pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
      {!isSignedIn && !bannerDismissed && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 text-sm">
          <span className="text-muted">
            Progress won&apos;t be saved.{' '}
            <Link href="/sign-up" className="text-confident hover:underline">
              Sign up free to track it
            </Link>
            .
          </span>
          <button
            onClick={() => setBannerDismissed(true)}
            className="ml-3 shrink-0 text-xs text-muted hover:text-foreground"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
      <header className="mb-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted">
          <span>
            Question {index + 1} of {total}
          </span>
          <span className="truncate pl-3 text-right">{modeLabel}</span>
        </div>
        <p className="mt-1 truncate text-xs text-muted">{current.category}</p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-card">
          <div
            className="h-full rounded-full bg-confident transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <section
        key={current.id}
        className="flex flex-1 flex-col rounded-3xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-3">
          {current.starred ? (
            <span
              title="65/20 starred"
              className="rounded-full border border-needs-practice/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-needs-practice"
            >
              ★ 65/20
            </span>
          ) : (
            <span />
          )}
          <SpeakerButton text={current.question} />
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
          {current.question}
        </h2>

        <div className="mt-6 flex-1">
          {!revealed ? (
            <div className="flex h-full min-h-[120px] items-center justify-center text-sm text-muted animate-pulse-soft">
              Think of your answer, then tap below.
            </div>
          ) : (
            <AnswerPanel
              question={current}
              showAll={showAllAnswers}
              onToggleShowAll={toggleShowAllAnswers}
              location={location}
              onLocationSaved={handleLocationSaved}
              onClearLocation={handleClearLocation}
            />
          )}
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mt-6 w-full rounded-2xl border border-border bg-background px-6 py-5 font-display text-base font-semibold transition hover:border-foreground/40"
          >
            Show answer
          </button>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => handleAnswer('needs_practice')}
              className="rounded-2xl bg-needs-practice/10 px-6 py-6 font-display text-lg font-semibold text-needs-practice ring-1 ring-needs-practice/30 transition hover:bg-needs-practice/15 active:scale-[0.99]"
            >
              Need more practice
            </button>
            <button
              onClick={() => handleAnswer('confident')}
              className="rounded-2xl bg-confident/10 px-6 py-6 font-display text-lg font-semibold text-confident ring-1 ring-confident/30 transition hover:bg-confident/15 active:scale-[0.99]"
            >
              Got it ✓
            </button>
          </div>
        )}
      </section>

      <footer className="mt-4 flex justify-between text-xs text-muted">
        <Link href={isSignedIn ? '/dashboard' : '/'} className="hover:text-foreground">
          ← Exit
        </Link>
        <span>
          {results.filter((r) => r.status === 'confident').length} got it ·{' '}
          {results.filter((r) => r.status === 'needs_practice').length} to
          practice
        </span>
      </footer>
    </div>
  )
}

const LOCATION_QUESTION_IDS = new Set([23, 29, 61, 62])

function getPersonalizedAnswers(questionId: number, location: LocationData): string[] | null {
  if (questionId === 23) return location.senators.length ? location.senators : null
  if (questionId === 29) return location.representative ? [location.representative] : null
  if (questionId === 61) return location.governor ? [location.governor] : null
  if (questionId === 62) return location.stateCapital ? [location.stateCapital] : null
  return null
}

function AnswerPanel({
  question,
  showAll,
  onToggleShowAll,
  location,
  onLocationSaved,
  onClearLocation,
}: {
  question: Question
  showAll: boolean
  onToggleShowAll: () => void
  location: LocationData | null
  onLocationSaved: (data: LocationData) => void
  onClearLocation: () => void
}) {
  const isLocationQuestion = question.variable && LOCATION_QUESTION_IDS.has(question.id)
  const personalizedAnswers = isLocationQuestion && location
    ? getPersonalizedAnswers(question.id, location)
    : null

  const multiple = question.answers.length > 1
  const baseAnswers = multiple && !showAll ? [question.answers[0]] : question.answers
  const displayed = personalizedAnswers ?? baseAnswers
  const isPersonalized = personalizedAnswers !== null

  return (
    <div className="animate-fade-in">
      {multiple && showAll && !isPersonalized && (
        <p className="mb-3 text-xs uppercase tracking-wider text-muted">
          Any of these answers is acceptable
        </p>
      )}
      {isPersonalized && question.id === 23 && displayed.length > 1 && (
        <p className="mb-3 text-xs uppercase tracking-wider text-muted">
          Either senator is acceptable
        </p>
      )}
      <ul className="space-y-2">
        {displayed.map((a, i) => (
          <li
            key={i}
            className="rounded-xl border border-confident/20 bg-confident/5 px-4 py-3 text-base text-foreground sm:text-lg"
          >
            {a}
          </li>
        ))}
      </ul>
      {isLocationQuestion && !location && (
        <ZipPrompt onSaved={onLocationSaved} />
      )}
      {isLocationQuestion && location && (
        <button
          onClick={onClearLocation}
          className="mt-3 text-xs text-muted hover:text-foreground"
        >
          Change ZIP ↺
        </button>
      )}
      {multiple && !isPersonalized && (
        <button
          onClick={onToggleShowAll}
          className="mt-3 text-xs text-muted hover:text-foreground"
        >
          {showAll
            ? 'Show first answer only ↑'
            : `Show all ${question.answers.length} answers ↓`}
        </button>
      )}
      {question.variable && !isLocationQuestion && (
        <p className="mt-3 text-xs text-muted">
          This answer changes with the current officeholder.
        </p>
      )}
    </div>
  )
}

function ZipPrompt({ onSaved }: { onSaved: (data: LocationData) => void }) {
  const [zip, setZip] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!/^\d{5}$/.test(zip)) {
      setError('Enter a valid 5-digit ZIP code.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/officials?zip=${zip}`)
      if (!res.ok) throw new Error('lookup failed')
      const data = await res.json() as Omit<LocationData, 'zip'>
      const locationData: LocationData = { zip, ...data }
      setStoredLocation(locationData)
      onSaved(locationData)
    } catch {
      setError('Could not look up your officials. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs text-muted">
        Enter your ZIP code to see your actual answer.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
          placeholder="ZIP code"
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-confident/40"
        />
        <button
          onClick={() => void handleSubmit()}
          disabled={loading || zip.length !== 5}
          className="rounded-xl bg-confident/10 px-4 py-2 text-sm font-semibold text-confident ring-1 ring-confident/30 transition hover:bg-confident/15 disabled:opacity-40"
        >
          {loading ? '…' : 'Lookup →'}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-needs-practice">{error}</p>}
    </div>
  )
}

function SessionSummary({
  correct,
  total,
  isSignedIn,
}: {
  correct: number
  total: number
  isSignedIn: boolean
}) {
  const [showSessionFeedback] = useState(() => {
    if (typeof window === 'undefined') return false
    return total >= 10 && total !== 128 && !localStorage.getItem('feedback_session_shown')
  })

  useEffect(() => {
    if (showSessionFeedback) localStorage.setItem('feedback_session_shown', '1')
  }, [showSessionFeedback])

  useEffect(() => {
    if (correct > 0) {
      void import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ colors: ['#4ade80', '#ffffff', '#000000'], particleCount: 100, spread: 80, origin: { y: 0.6 } })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto flex min-h-[calc(100svh-64px)] max-w-xl flex-col items-center justify-center px-5 pt-12 pb-[calc(3rem+env(safe-area-inset-bottom))] text-center">
      <p className="text-sm uppercase tracking-[0.18em] text-muted">Session complete</p>
      <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">
        {correct}/{total}
      </h1>
      <p className="mt-3 text-muted">
        You marked yourself confident on {correct} of {total} questions.
      </p>
      <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/study"
          className="rounded-2xl border border-border bg-card px-5 py-4 font-display font-semibold transition hover:border-confident/40"
        >
          Study again
        </Link>
        <Link
          href="/dashboard"
          className="rounded-2xl border border-confident/40 bg-confident/10 px-5 py-4 font-display font-semibold text-confident transition hover:bg-confident/15"
        >
          Back to dashboard
        </Link>
      </div>
      {total === 128 && <FeedbackPrompt trigger="all_128" />}
      {showSessionFeedback && <FeedbackPrompt trigger="session_end" />}
      {!isSignedIn && (
        <p className="mt-6 text-sm text-muted">
          <Link href="/sign-up" className="text-confident hover:underline">
            Sign up free
          </Link>{' '}
          to save your progress and track it over time.
        </p>
      )}
    </div>
  )
}
