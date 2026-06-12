'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { Question, Status } from '@/lib/types'
import { saveProgress } from '@/lib/progress-client'
import { track } from '@/lib/analytics'

interface Props {
  initialQuestions: Question[]
  modeLabel: string
  mode: string
}

interface SessionResult {
  questionId: number
  status: Status
}

const ADVANCE_MS = 800

export function StudySession({ initialQuestions, modeLabel, mode }: Props) {
  const [questions] = useState(initialQuestions)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState<SessionResult[]>([])
  const [finished, setFinished] = useState(false)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    return <SessionSummary correct={correct} total={results.length} />
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12 text-center text-muted">
        No questions in this session.
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-2xl flex-col px-5 py-6 sm:py-10">
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
            <AnswerPanel question={current} />
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
        <Link href="/dashboard" className="hover:text-foreground">
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

function AnswerPanel({ question }: { question: Question }) {
  const multiple = question.answers.length > 1
  return (
    <div className="animate-fade-in">
      {multiple && (
        <p className="mb-3 text-xs uppercase tracking-wider text-muted">
          Any of these answers is acceptable
        </p>
      )}
      <ul className="space-y-2">
        {question.answers.map((a, i) => (
          <li
            key={i}
            className="rounded-xl border border-confident/20 bg-confident/5 px-4 py-3 text-base text-foreground sm:text-lg"
          >
            {a}
          </li>
        ))}
      </ul>
      {question.variable && (
        <p className="mt-3 text-xs text-muted">
          This answer changes by current officeholder or location. Check the
          USCIS site for the latest answer.
        </p>
      )}
    </div>
  )
}

function SpeakerButton({ text }: { text: string }) {
  const [supported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  )
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speak = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.95
    u.pitch = 1
    u.lang = 'en-US'
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(u)
  }, [supported, text])

  if (!supported) return <span />

  return (
    <button
      type="button"
      onClick={speak}
      aria-label="Read question aloud"
      className={`rounded-full border border-border bg-background p-2 text-muted transition hover:text-foreground ${
        speaking ? 'animate-pulse-soft text-confident' : ''
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M11 5 6 9H2v6h4l5 4z" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    </button>
  )
}

function SessionSummary({ correct, total }: { correct: number; total: number }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-xl flex-col items-center justify-center px-5 py-12 text-center">
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
    </div>
  )
}
