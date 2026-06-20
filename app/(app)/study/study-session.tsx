'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { Question, Status } from '@/lib/types'
import { saveProgress } from '@/lib/progress-client'
import { track } from '@/lib/analytics'
import { FeedbackPrompt } from '@/components/feedback-prompt'
import { SpeakerButton } from '@/components/speaker-button'
import { getStoredLocation, setStoredLocation, clearStoredLocation, type LocationData } from '@/lib/location'
import { fireConfetti } from '@/lib/confetti'
import { useLanguage } from '@/lib/use-language'
import { getCategoryName } from '@/lib/category-names'
import { saveSession, loadSession, clearSession, type SavedSession } from '@/lib/session-state'

interface Props {
  initialQuestions: Question[]
  mode: string
  category?: string
  isSignedIn?: boolean
}

interface SessionResult {
  questionId: number
  status: Status
}

const ADVANCE_MS = 800

export function StudySession({ initialQuestions, mode, category, isSignedIn = true }: Props) {
  const t = useTranslations('study')
  const [lang] = useLanguage()
  const modeLabel = mode === 'starred'
    ? t('modeStarred')
    : mode === 'weak'
      ? t('modeWeak')
      : category
        ? getCategoryName(category, lang)
        : t('modeAll')

  // Build ordered questions: resume from saved session if available, else use server-shuffled order
  const [questions] = useState<Question[]>(() => {
    const saved = loadSession(mode, category)
    if (saved && saved.index > 0) {
      const byId = new Map(initialQuestions.map((q) => [q.id, q]))
      const reordered = saved.questionIds.map((id) => byId.get(id)).filter(Boolean) as Question[]
      if (reordered.length === initialQuestions.length) return reordered
    }
    return initialQuestions
  })

  const [savedSession] = useState<SavedSession | null>(() => {
    const s = loadSession(mode, category)
    return s && s.index > 0 ? s : null
  })

  const [resumePrompt, setResumePrompt] = useState<boolean>(() => {
    const s = loadSession(mode, category)
    return Boolean(s && s.index > 0)
  })

  const [index, setIndex] = useState(() => {
    // Don't restore index yet — wait for resume prompt response
    return 0
  })
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState<SessionResult[]>([])
  const [finished, setFinished] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [exitConfirm, setExitConfirm] = useState(false)
  const exitHref = isSignedIn ? '/dashboard' : '/'
  const [showAllAnswers, setShowAllAnswers] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('civics:show-all-answers') === 'true'
  })
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firedMilestones = useRef<Set<number>>(new Set())

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
        const nextIndex = index + 1
        const completedFraction = nextIndex / total
        for (const threshold of [0.25, 0.5, 0.75]) {
          if (completedFraction >= threshold && !firedMilestones.current.has(threshold)) {
            firedMilestones.current.add(threshold)
            fireConfetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } })
          }
        }
        if (nextIndex >= total) {
          clearSession(mode, category)
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
          saveSession(mode, category, questions.map((q) => q.id), nextIndex)
          setIndex((i) => i + 1)
          setRevealed(false)
        }
      }, ADVANCE_MS)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current, index, total],
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (finished) return
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (!revealed) setRevealed(true)
      } else if (revealed) {
        if (e.key === '1' || e.key === 'ArrowLeft') {
          handleAnswer('needs_practice')
        } else if (e.key === '2' || e.key === 'ArrowRight') {
          handleAnswer('confident')
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [revealed, finished, handleAnswer])

  if (resumePrompt && savedSession) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-64px)] max-w-xl flex-col items-center justify-center px-5 text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">{t('resumeLabel')}</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          {t('resumeTitle', { n: savedSession.index + 1, total: questions.length })}
        </h1>
        <p className="mt-3 text-muted">{t('resumeDesc')}</p>
        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => {
              clearSession(mode, category)
              setResumePrompt(false)
            }}
            className="rounded-2xl border border-border bg-card px-5 py-4 font-display font-semibold transition hover:border-confident/40"
          >
            {t('resumeStartOver')}
          </button>
          <button
            onClick={() => {
              setIndex(savedSession.index)
              setResumePrompt(false)
            }}
            className="rounded-2xl border border-confident/40 bg-confident/10 px-5 py-4 font-display font-semibold text-confident transition hover:bg-confident/15"
          >
            {t('resumeContinue')}
          </button>
        </div>
      </div>
    )
  }

  if (finished) {
    const correct = results.filter((r) => r.status === 'confident').length
    return <SessionSummary correct={correct} total={results.length} isSignedIn={isSignedIn} mode={mode} />
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12 text-center text-muted">
        {t('noQuestions')}
      </div>
    )
  }

  const questionText = lang === 'es' ? (current.questionEs ?? current.question) : current.question

  return (
    <div className="mx-auto flex min-h-[calc(100svh-64px)] max-w-2xl flex-col px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pt-10 sm:pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
      {!isSignedIn && !bannerDismissed && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 text-sm">
          <span className="text-muted">
            {t.rich('guestBanner', {
              link: (chunks) => (
                <Link href="/sign-up" className="text-confident hover:underline">
                  {chunks}
                </Link>
              ),
            })}
          </span>
          <button
            onClick={() => setBannerDismissed(true)}
            className="ml-3 shrink-0 text-xs text-muted hover:text-foreground"
            aria-label={t('dismiss')}
          >
            ×
          </button>
        </div>
      )}
      <header className="mb-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted">
          <span>{t('questionOf', { n: index + 1, total })}</span>
          <span className="truncate pl-3 text-right">{modeLabel}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted">
          <p className="truncate">{getCategoryName(current.category, lang)}</p>
          {mode === 'category' && (
            <span className="shrink-0 pl-3 text-confident">
              {results.filter((r) => r.status === 'confident').length} {t('masteredThis')}
            </span>
          )}
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-card">
          <div
            className="h-full rounded-full bg-confident transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <section
        key={current.id}
        className="flex flex-1 flex-col rounded-3xl border border-border bg-card p-4 sm:p-8"
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
          <SpeakerButton text={questionText} lang={lang} />
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
          {questionText}
        </h2>

        <div className="mt-3 flex-1">
          {!revealed ? (
            <div className="flex h-full min-h-[60px] items-center justify-center text-sm text-muted animate-pulse-soft">
              {t('thinkPrompt')}
            </div>
          ) : (
            <AnswerPanel
              question={current}
              showAll={showAllAnswers}
              onToggleShowAll={toggleShowAllAnswers}
              location={location}
              onLocationSaved={handleLocationSaved}
              onClearLocation={handleClearLocation}
              lang={lang}
            />
          )}
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="mt-4 w-full rounded-2xl border border-border bg-background px-6 py-3 font-display text-base font-semibold transition hover:border-foreground/40"
          >
            {t('showAnswer')}
          </button>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => handleAnswer('needs_practice')}
              className="rounded-2xl bg-needs-practice/10 px-6 py-4 font-display text-lg font-semibold text-needs-practice ring-1 ring-needs-practice/30 transition hover:bg-needs-practice/15 active:scale-[0.99]"
            >
              {t('needsPractice')}
            </button>
            <button
              onClick={() => handleAnswer('confident')}
              className="rounded-2xl bg-confident/10 px-6 py-4 font-display text-lg font-semibold text-confident ring-1 ring-confident/30 transition hover:bg-confident/15 active:scale-[0.99]"
            >
              {t('gotIt')}
            </button>
          </div>
        )}
      </section>

      <footer className="mt-4 flex items-center justify-between text-xs text-muted">
        {exitConfirm ? (
          <span className="flex items-center gap-2">
            <span>{t('exitConfirm')}</span>
            <Link href={exitHref} className="font-semibold text-needs-practice hover:underline">
              {t('exitYes')}
            </Link>
            <button onClick={() => setExitConfirm(false)} className="hover:text-foreground">
              {t('exitNo')}
            </button>
          </span>
        ) : (
          <button
            onClick={() => { if (index > 0) setExitConfirm(true); else window.location.href = exitHref }}
            className="hover:text-foreground"
          >
            {t('exit')}
          </button>
        )}
        <span className="hidden sm:inline opacity-50">
          {t('keyboardHint')}
        </span>
        <span>
          {t('score', {
            confident: results.filter((r) => r.status === 'confident').length,
            practice: results.filter((r) => r.status === 'needs_practice').length,
          })}
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
  lang,
}: {
  question: Question
  showAll: boolean
  onToggleShowAll: () => void
  location: LocationData | null
  onLocationSaved: (data: LocationData) => void
  onClearLocation: () => void
  lang: 'en' | 'es'
}) {
  const t = useTranslations('study')
  const isLocationQuestion = question.variable && LOCATION_QUESTION_IDS.has(question.id)
  const personalizedAnswers = isLocationQuestion && location
    ? getPersonalizedAnswers(question.id, location)
    : null

  const sourceAnswers = lang === 'es' ? (question.answersEs ?? question.answers) : question.answers
  const multiple = sourceAnswers.length > 1
  const baseAnswers = multiple && !showAll ? [sourceAnswers[0]] : sourceAnswers
  const displayed = personalizedAnswers ?? baseAnswers
  const isPersonalized = personalizedAnswers !== null

  return (
    <div className="animate-fade-in">
      {multiple && showAll && !isPersonalized && (
        <p className="mb-3 text-xs uppercase tracking-wider text-muted">
          {t('anyAnswer')}
        </p>
      )}
      {isPersonalized && question.id === 23 && displayed.length > 1 && (
        <p className="mb-3 text-xs uppercase tracking-wider text-muted">
          {t('eitherSenator')}
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
          {t('changeZip')}
        </button>
      )}
      {multiple && !isPersonalized && (
        <button
          onClick={onToggleShowAll}
          className="mt-3 text-xs text-muted hover:text-foreground"
        >
          {showAll
            ? t('showFirstOnly')
            : t('showAll', { n: sourceAnswers.length })}
        </button>
      )}
      {question.variable && !isLocationQuestion && (
        <p className="mt-3 text-xs text-muted">
          {t('variableAnswer')}
        </p>
      )}
    </div>
  )
}

function ZipPrompt({ onSaved }: { onSaved: (data: LocationData) => void }) {
  const t = useTranslations('study')
  const [zip, setZip] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!/^\d{5}$/.test(zip)) {
      setError(t('zipError'))
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
      setError(t('zipLookupError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs text-muted">
        {t('zipPrompt')}
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
          placeholder={t('zipPlaceholder')}
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-confident/40"
        />
        <button
          onClick={() => void handleSubmit()}
          disabled={loading || zip.length !== 5}
          className="rounded-xl bg-confident/10 px-4 py-2 text-sm font-semibold text-confident ring-1 ring-confident/30 transition hover:bg-confident/15 disabled:opacity-40"
        >
          {loading ? '…' : t('zipLookup')}
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
  mode,
}: {
  correct: number
  total: number
  isSignedIn: boolean
  mode: string
}) {
  const t = useTranslations('study')
  const [showSessionFeedback] = useState(() => {
    if (typeof window === 'undefined') return false
    return total >= 10 && total !== 128 && !localStorage.getItem('feedback_session_shown')
  })

  useEffect(() => {
    if (showSessionFeedback) localStorage.setItem('feedback_session_shown', '1')
  }, [showSessionFeedback])

  useEffect(() => {
    if (mode === 'category' && correct === total) {
      fireConfetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } })
    } else if (correct > 0) {
      fireConfetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto flex min-h-[calc(100svh-64px)] max-w-xl flex-col items-center justify-center px-5 pt-12 pb-[calc(3rem+env(safe-area-inset-bottom))] text-center">
      <p className="text-sm uppercase tracking-[0.18em] text-muted">{t('sessionComplete')}</p>
      <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">
        {correct}/{total}
      </h1>
      <p className="mt-3 text-muted">
        {t('sessionSummary', { confident: correct, total })}
      </p>
      <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/study"
          className="rounded-2xl border border-border bg-card px-5 py-4 font-display font-semibold transition hover:border-confident/40"
        >
          {t('studyAgain')}
        </Link>
        <Link
          href="/dashboard"
          className="rounded-2xl border border-confident/40 bg-confident/10 px-5 py-4 font-display font-semibold text-confident transition hover:bg-confident/15"
        >
          {t('backToDashboard')}
        </Link>
      </div>
      {total === 128 && <FeedbackPrompt trigger="all_128" />}
      {showSessionFeedback && <FeedbackPrompt trigger="session_end" />}
      {!isSignedIn && (
        <p className="mt-6 text-sm text-muted">
          {t.rich('signUpPrompt', {
            link: (chunks) => (
              <Link href="/sign-up" className="text-confident hover:underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
      )}
    </div>
  )
}
