'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { Question } from '@/lib/types'
import { track } from '@/lib/analytics'
import { FeedbackPrompt } from '@/components/feedback-prompt'
import { ShareScore } from '@/components/share-score'
import { SpeakerButton } from '@/components/speaker-button'
import { fireConfetti } from '@/lib/confetti'
import { useLanguage } from '@/lib/use-language'
import { getCategoryName } from '@/lib/category-names'

interface Result {
  question: Question
  correct: boolean
}

const PASS_THRESHOLD = 12

export function MockTest({ questions }: { questions: Question[] }) {
  const router = useRouter()
  const t = useTranslations('test')
  const [lang] = useLanguage()
  const [index, setIndex] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [finished, setFinished] = useState(false)
  const [answerRevealed, setAnswerRevealed] = useState(false)
  const [exitConfirm, setExitConfirm] = useState(false)

  const total = questions.length
  const current = questions[index]

  useEffect(() => {
    track('mock_test_started', { total })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (finished) return
    function onKey(e: KeyboardEvent) {
      if (e.key === '1' || e.key === 'ArrowLeft') record(false)
      else if (e.key === '2' || e.key === 'ArrowRight') record(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, finished])

  function record(correct: boolean) {
    if (!current) return
    const next = [...results, { question: current, correct }]
    if (index + 1 >= total) {
      const score = next.filter((r) => r.correct).length
      const passed = score >= PASS_THRESHOLD
      track('mock_test_completed', { total, correct: score, passed })
      fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, total }),
      })
      setResults(next)
      setFinished(true)
    } else {
      setResults(next)
      setIndex(index + 1)
      setAnswerRevealed(false)
    }
  }

  if (finished) {
    return (
      <TestSummary
        results={results}
        onRetake={() => {
          setIndex(0)
          setResults([])
          setFinished(false)
          router.refresh()
        }}
      />
    )
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12 text-center text-muted">
        No questions available.
      </div>
    )
  }

  const progressPct = Math.round((index / total) * 100)
  const questionText = lang === 'es' ? (current.questionEs ?? current.question) : current.question

  return (
    <div className="mx-auto flex min-h-[calc(100svh-64px)] max-w-2xl flex-col px-5 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pt-10 sm:pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
      <header className="mb-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted">
          <span>{t('progressLabel', { n: index + 1, total })}</span>
          <span>{t('passHint', { threshold: PASS_THRESHOLD })}</span>
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
        className="flex flex-1 flex-col rounded-3xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-wider text-muted">
            {getCategoryName(current.category, lang)}
          </p>
          <SpeakerButton text={questionText} lang={lang} />
        </div>
        <h2 className="mt-3 font-display text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
          {questionText}
        </h2>

        <div className="flex-1 py-6">
          {answerRevealed ? (
            <div className="animate-fade-in">
              <p className="mb-2 text-xs uppercase tracking-wider text-muted">{t('answers')}</p>
              <ul className="space-y-2">
                {(lang === 'es' ? (current.answersEs ?? current.answers) : current.answers).map((a, i) => (
                  <li key={i} className="rounded-xl border border-confident/20 bg-confident/5 px-4 py-3 text-base text-foreground">
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <p className="text-sm text-muted">{t('instruction')}</p>
              <button
                onClick={() => setAnswerRevealed(true)}
                className="rounded-xl border border-border px-4 py-2 text-xs text-muted transition hover:border-foreground/40 hover:text-foreground"
              >
                {t('revealAnswer')}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => record(false)}
            className="rounded-2xl bg-needs-practice/10 px-6 py-6 font-display text-lg font-semibold text-needs-practice ring-1 ring-needs-practice/30 transition hover:bg-needs-practice/15 active:scale-[0.99]"
          >
            {t('wrong')}
          </button>
          <button
            onClick={() => record(true)}
            className="rounded-2xl bg-confident/10 px-6 py-6 font-display text-lg font-semibold text-confident ring-1 ring-confident/30 transition hover:bg-confident/15 active:scale-[0.99]"
          >
            {t('right')}
          </button>
        </div>
      </section>

      <footer className="mt-4 flex items-center justify-between text-xs text-muted">
        {exitConfirm ? (
          <span className="flex items-center gap-2">
            <span>{t('exitConfirm')}</span>
            <Link href="/dashboard" className="font-semibold text-needs-practice hover:underline">
              {t('exitYes')}
            </Link>
            <button onClick={() => setExitConfirm(false)} className="hover:text-foreground">
              {t('exitNo')}
            </button>
          </span>
        ) : (
          <button
            onClick={() => { if (index > 0) setExitConfirm(true); else window.location.href = '/dashboard' }}
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
            right: results.filter((r) => r.correct).length,
            wrong: results.filter((r) => !r.correct).length,
          })}
        </span>
      </footer>
    </div>
  )
}

function TestSummary({
  results,
  onRetake,
}: {
  results: Result[]
  onRetake: () => void
}) {
  const t = useTranslations('test')
  const [lang] = useLanguage()
  const score = results.filter((r) => r.correct).length
  const passed = score >= PASS_THRESHOLD
  const wrong = results.filter((r) => !r.correct)

  useEffect(() => {
    if (passed) fireConfetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">
          {t('complete')}
        </p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">
          {score} / {results.length}
        </h1>
        <p
          className={`mt-3 font-display text-lg font-semibold ${
            passed ? 'text-confident' : 'text-needs-practice'
          }`}
        >
          {passed ? t('pass') : t('fail')}
        </p>
        <p className="mt-1 text-sm text-muted">
          {t('passThreshold', { threshold: PASS_THRESHOLD, total: results.length })}
        </p>
      </div>

      {wrong.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-lg font-semibold">
            {t('reviewThese')}
          </h2>
          <ul className="space-y-3">
            {wrong.map((r) => (
              <li
                key={r.question.id}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <p className="text-xs text-muted">
                  #{r.question.id} · {getCategoryName(r.question.category, lang)}
                </p>
                <p className="mt-1 font-display text-base font-semibold">
                  {lang === 'es' ? (r.question.questionEs ?? r.question.question) : r.question.question}
                </p>
                <ul className="mt-3 space-y-1 text-sm text-muted">
                  {(lang === 'es' ? (r.question.answersEs ?? r.question.answers) : r.question.answers).map((a, i) => (
                    <li
                      key={i}
                      className="rounded-md border border-confident/20 bg-confident/5 px-3 py-2 text-foreground"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={onRetake}
          className="rounded-2xl border border-border bg-card px-5 py-4 font-display font-semibold transition hover:border-confident/40"
        >
          {t('retake')}
        </button>
        <Link
          href="/dashboard"
          className="rounded-2xl border border-confident/40 bg-confident/10 px-5 py-4 text-center font-display font-semibold text-confident transition hover:bg-confident/15"
        >
          {t('backToDashboard')}
        </Link>
      </div>
      <div className="mt-3">
        <ShareScore score={score} total={results.length} />
      </div>
      <FeedbackPrompt trigger="mock_test" />
    </div>
  )
}
