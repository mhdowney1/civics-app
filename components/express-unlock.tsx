'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { loadStripe } from '@stripe/stripe-js'
import {
  CheckoutElementsProvider,
  ExpressCheckoutElement,
  useCheckoutElements,
} from '@stripe/react-stripe-js/checkout'
import { track } from '@/lib/analytics'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
// Created once at module scope, per Stripe's guidance.
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

type Props = {
  // Called with true once wallet buttons are on screen, false if none can show.
  onAvailabilityChange?: (available: boolean) => void
}

function createClientSecret(onAlreadyPaid: () => void): Promise<string> {
  const refCode = localStorage.getItem('ref_code')
  return fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ui: 'elements', referralCode: refCode ?? undefined }),
  }).then(async (res) => {
    const data = await res.json()
    if (data.alreadyPaid) {
      onAlreadyPaid()
      throw new Error('already_paid')
    }
    if (!data.clientSecret) throw new Error(data.error ?? 'checkout_failed')
    return data.clientSecret as string
  })
}

// One-tap Apple Pay / Google Pay / Link unlock. Renders nothing when no wallet
// is available on this device, so callers should keep a card fallback.
// Client-only (load with next/dynamic, ssr: false): it creates one Checkout
// Session per mount, which needs the browser (localStorage, cookies).
export default function ExpressUnlock({ onAvailabilityChange }: Props) {
  const router = useRouter()
  const [clientSecret] = useState(() =>
    createClientSecret(() => router.replace('/dashboard')),
  )

  if (!stripePromise) return null

  return (
    <CheckoutElementsProvider
      stripe={stripePromise}
      options={{
        clientSecret,
        elementsOptions: { appearance: { theme: 'stripe' } },
      }}
    >
      <ExpressButtons onAvailabilityChange={onAvailabilityChange} />
    </CheckoutElementsProvider>
  )
}

function ExpressButtons({ onAvailabilityChange }: Props) {
  const t = useTranslations('billing')
  const state = useCheckoutElements()
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (state.type === 'error') onAvailabilityChange?.(false)
  }, [state.type, onAvailabilityChange])

  if (state.type === 'error') return null

  return (
    <div>
      <div style={{ visibility: visible ? 'visible' : 'hidden' }}>
        <ExpressCheckoutElement
          options={{
            buttonType: { applePay: 'buy', googlePay: 'buy' },
            buttonHeight: 55,
            buttonTheme: undefined,
            layout: { maxRows: 1, maxColumns: 1, overflow: 'never' },
            paymentMethodOrder: undefined,
            paymentMethods: undefined,
          }}
          onReady={({ availablePaymentMethods }) => {
            const wallets = availablePaymentMethods
              ? Object.entries(availablePaymentMethods)
                  .filter(([, on]) => on)
                  .map(([name]) => name)
              : []
            const available = wallets.length > 0
            setVisible(available)
            onAvailabilityChange?.(available)
            track('express_checkout_shown', { wallets })
          }}
          onCancel={() => track('express_checkout_cancelled')}
          onConfirm={async (event) => {
            if (state.type !== 'success') return
            setError(null)
            track('express_checkout_confirmed', { wallet: event.expressPaymentType })
            const result = await state.checkout.confirm({
              expressCheckoutConfirmEvent: event,
            })
            // On success Stripe redirects to the session's return_url.
            if (result.type === 'error') {
              track('express_checkout_confirm_failed', {
                error_code: result.error.code,
              })
              setError(t('paymentFailed'))
            }
          }}
        />
      </div>
      {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}
    </div>
  )
}
