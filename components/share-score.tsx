'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const STORAGE_KEY = 'ref_code'

interface ShareScoreProps {
  score: number
  total: number
}

export function ShareScore({ score, total }: ShareScoreProps) {
  const t = useTranslations('share')
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/referral')
      .then((r) => r.json())
      .then((data: { referralCode?: string }) => {
        if (data.referralCode) setReferralCode(data.referralCode)
      })
      .catch(() => {})
  }, [])

  const shareUrl = referralCode
    ? `https://civicsstudy.com/results?score=${score}&total=${total}&ref=${referralCode}`
    : `https://civicsstudy.com/results?score=${score}&total=${total}`

  const result = score >= Math.ceil(total * 0.6) ? t('pass') : t('fail')
  const shareText = t('text', { score, total, result })

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'US Civics Test Result', text: shareText, url: shareUrl })
        return
      } catch {
        // fallthrough to clipboard
      }
    }
    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className="w-full rounded-2xl border border-border bg-card px-5 py-4 font-display font-semibold text-muted transition hover:border-confident/40 hover:text-foreground"
    >
      {copied ? t('copied') : t('button')}
    </button>
  )
}

export function ProcessReferral() {
  useEffect(() => {
    const code = localStorage.getItem(STORAGE_KEY)
    if (!code) return
    fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralCode: code }),
    })
      .then(() => localStorage.removeItem(STORAGE_KEY))
      .catch(() => {})
  }, [])

  return null
}

export function CaptureRefParam() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) localStorage.setItem(STORAGE_KEY, ref)
  }, [])

  return null
}
