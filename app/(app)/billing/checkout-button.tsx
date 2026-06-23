'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { track } from '@/lib/analytics'

export function CheckoutButton() {
  const t = useTranslations('billing')
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    track('checkout_initiated')
    const refCode = localStorage.getItem('ref_code')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: refCode ?? undefined }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full rounded-2xl bg-confident px-6 py-5 font-display text-lg font-semibold text-white transition hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
    >
      {loading ? t('redirecting') : t('unlockButton')}
    </button>
  )
}
