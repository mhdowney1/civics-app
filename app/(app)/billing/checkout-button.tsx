'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { track } from '@/lib/analytics'

// Card fallback: redirects to Stripe's hosted Checkout page.
export function CheckoutButton({
  price,
  variant = 'primary',
}: {
  price: string
  variant?: 'primary' | 'secondary'
}) {
  const t = useTranslations('billing')
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    track('checkout_initiated', { checkout_ui: 'hosted' })
    const refCode = localStorage.getItem('ref_code')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ui: 'hosted', referralCode: refCode ?? undefined }),
      })
      const data = await res.json()
      if (data.alreadyPaid) {
        router.replace('/dashboard')
      } else if (data.url) {
        window.location.href = data.url
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  const styles =
    variant === 'primary'
      ? 'bg-confident text-white hover:opacity-90'
      : 'border border-border hover:border-foreground/40'

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full rounded-2xl px-6 py-5 font-display text-lg font-semibold transition active:scale-[0.99] disabled:opacity-60 ${styles}`}
    >
      {loading
        ? t('redirecting')
        : variant === 'primary'
          ? t('unlockButton', { price })
          : t('payWithCard')}
    </button>
  )
}
