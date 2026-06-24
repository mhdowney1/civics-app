'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { setFontSize, type FontSize } from '@/lib/font-size'
import { getStoredLocation, setStoredLocation, type LocationData } from '@/lib/location'

interface Props {
  zip: string | null
  dailyGoal: number | null
  fontSize: string | null
  interviewDate: string | null
  userEmail: string
}

export function SettingsUI({ zip: initialZip, dailyGoal: initialGoal, fontSize: initialFontSize, interviewDate, userEmail }: Props) {
  const t = useTranslations('settings')
  const locale = useLocale()
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [contactMessage, setContactMessage] = useState('')
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const [zipInput, setZipInput] = useState(initialZip ?? '')
  const [zipError, setZipError] = useState('')
  const [zipLoading, setZipLoading] = useState(false)
  const [zipSaved, setZipSaved] = useState(false)

  const [dailyGoal, setDailyGoalState] = useState<number>(initialGoal ?? 10)
  const [fontSize, setFontSizeState] = useState<FontSize>((initialFontSize as FontSize) ?? 'normal')

  // Seed localStorage from DB on new device
  useEffect(() => {
    if (initialZip && !getStoredLocation()) {
      fetch(`/api/officials?zip=${initialZip}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: Omit<LocationData, 'zip'> | null) => {
          if (data) setStoredLocation({ zip: initialZip, ...data })
        })
        .catch(() => {})
    }
  }, [initialZip])

  async function saveZip() {
    if (!/^\d{5}$/.test(zipInput)) {
      setZipError(t('zipError'))
      return
    }
    setZipError('')
    setZipLoading(true)
    try {
      const res = await fetch(`/api/officials?zip=${zipInput}`)
      if (!res.ok) throw new Error()
      const data = await res.json() as Omit<LocationData, 'zip'>
      setStoredLocation({ zip: zipInput, ...data })
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zip: zipInput }),
      })
      setZipSaved(true)
      startTransition(() => router.refresh())
    } catch {
      setZipError(t('zipLookupError'))
    } finally {
      setZipLoading(false)
    }
  }

  async function saveDailyGoal(goal: number) {
    setDailyGoalState(goal)
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyGoal: goal }),
    })
  }

  async function saveFontSizeOption(size: FontSize) {
    setFontSizeState(size)
    setFontSize(size)
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fontSize: size }),
    })
  }

  async function sendContact() {
    if (!contactMessage.trim()) return
    setContactStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: contactMessage }),
      })
      if (!res.ok) throw new Error()
      setContactStatus('sent')
      setContactMessage('')
    } catch {
      setContactStatus('error')
    }
  }

  const interviewFormatted = interviewDate
    ? new Date(interviewDate + 'T12:00:00').toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <h1 className="mb-8 font-display text-3xl font-semibold tracking-tight">{t('title')}</h1>

      {/* Location */}
      <Section title={t('locationTitle')}>
        <p className="mb-3 text-sm text-muted">{t('zipDesc')}</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zipInput}
            onChange={(e) => { setZipInput(e.target.value.replace(/\D/g, '')); setZipSaved(false) }}
            placeholder={t('zipPlaceholder')}
            className="w-28 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-confident/40"
          />
          <button
            onClick={saveZip}
            disabled={zipLoading || zipInput.length !== 5}
            className="rounded-lg bg-confident/10 px-3 py-1.5 text-sm font-semibold text-confident ring-1 ring-confident/30 transition hover:bg-confident/15 disabled:opacity-40"
          >
            {zipLoading ? '…' : t('save')}
          </button>
          {zipSaved && <span className="text-sm text-confident">✓</span>}
        </div>
        {zipError && <p className="mt-1.5 text-xs text-needs-practice">{zipError}</p>}
      </Section>

      {/* Daily goal */}
      <Section title={t('dailyGoalTitle')}>
        <p className="mb-3 text-sm text-muted">{t('dailyGoalDesc')}</p>
        <div className="flex w-fit items-center rounded-full border border-border bg-background p-0.5">
          {([5, 10, 20] as const).map((n) => (
            <button
              key={n}
              onClick={() => saveDailyGoal(n)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                dailyGoal === n ? 'bg-foreground text-background' : 'text-muted hover:text-foreground'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">{t('dailyGoalSet', { n: dailyGoal })}</p>
      </Section>

      {/* Font size */}
      <Section title={t('fontSizeTitle')}>
        <p className="mb-3 text-sm text-muted">{t('fontSizeDesc')}</p>
        <div className="flex w-fit items-center gap-1 rounded-full border border-border bg-background p-0.5">
          {([
            { value: 'normal' as FontSize, className: 'text-sm' },
            { value: 'large' as FontSize, className: 'text-base' },
            { value: 'larger' as FontSize, className: 'text-lg' },
          ]).map(({ value, className }) => (
            <button
              key={value}
              onClick={() => saveFontSizeOption(value)}
              className={`rounded-full px-4 py-1 font-semibold transition ${className} ${
                fontSize === value ? 'bg-foreground text-background' : 'text-muted hover:text-foreground'
              }`}
            >
              A
            </button>
          ))}
        </div>
      </Section>

      {/* Interview date */}
      <Section title={t('interviewDateTitle')}>
        <p className="mb-3 text-sm text-muted">
          {interviewFormatted ?? t('interviewDateNone')}
        </p>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-confident hover:underline"
        >
          {interviewFormatted ? t('interviewDateChange') : t('interviewDateSet')} →
        </Link>
      </Section>

      {/* Contact */}
      <Section title="Contact us">
        <p className="mb-3 text-sm text-muted">Have a question or feedback? Send us a message and we&apos;ll reply to {userEmail || 'your email'}.</p>
        {contactStatus === 'sent' ? (
          <p className="text-sm text-confident">Message sent — we&apos;ll be in touch soon.</p>
        ) : (
          <>
            <textarea
              value={contactMessage}
              onChange={(e) => { setContactMessage(e.target.value); if (contactStatus === 'error') setContactStatus('idle') }}
              placeholder="What's on your mind?"
              rows={4}
              className="mb-3 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-confident/40"
            />
            <button
              onClick={sendContact}
              disabled={contactStatus === 'sending' || !contactMessage.trim()}
              className="rounded-lg bg-confident/10 px-3 py-1.5 text-sm font-semibold text-confident ring-1 ring-confident/30 transition hover:bg-confident/15 disabled:opacity-40"
            >
              {contactStatus === 'sending' ? 'Sending…' : 'Send message'}
            </button>
            {contactStatus === 'error' && (
              <p className="mt-2 text-xs text-needs-practice">Something went wrong — please try again.</p>
            )}
          </>
        )}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-4 font-display text-base font-semibold">{title}</h2>
      {children}
    </div>
  )
}
