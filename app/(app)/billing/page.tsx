import Link from 'next/link'
import { CheckoutButton } from './checkout-button'

export const metadata = { title: 'Unlock full access · US Civics Study' }

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <div className="rounded-3xl border border-border bg-card p-8">
        <p className="text-sm uppercase tracking-[0.18em] text-muted">
          One-time payment
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Unlock full access
        </h1>
        <p className="mt-3 text-muted">
          Everything you need to pass your civics test — practice as many times
          as you like.
        </p>

        <div className="my-8 text-center">
          <span className="font-display text-6xl font-semibold tracking-tight">
            $10
          </span>
          <p className="mt-1 text-sm text-muted">one-time · yours forever</p>
        </div>

        <ul className="mb-8 space-y-3 text-sm">
          {[
            'Unlimited mock tests',
            'Detailed progress analytics',
            'All 128 official USCIS questions',
            'Works offline, no subscription',
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <span className="text-confident">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <CheckoutButton />
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Already unlocked?{' '}
        <Link href="/dashboard" className="underline hover:text-foreground">
          Go to dashboard
        </Link>
      </p>
    </div>
  )
}
