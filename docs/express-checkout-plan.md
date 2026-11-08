# Express Checkout plan (Apple Pay / Google Pay one-tap unlock)

Goal: when paid traffic lands, someone who has tried the app can unlock with a single Apple Pay or Google Pay tap, without leaving civicsstudy.com.

Based on the repo at `bc72d55` (24 Jun 2026).

---

## 1. Where we are today

| Piece | File | Notes |
|---|---|---|
| Paywall gate | `lib/server-access.ts` | `PAYMENT_REQUIRED=true` env var turns the paywall on. One free mock test, then `/test` redirects to `/billing`. |
| Billing page | `app/(app)/billing/*` | Price card plus a single "Unlock for $12.99" button. Price is hardcoded in `messages/en.json` / `es.json`. |
| Checkout | `app/api/checkout/route.ts` | Creates a **hosted** Stripe Checkout Session (`mode: 'payment'`), then `window.location` redirects to stripe.com. Referral coupon or promo codes, `automatic_tax`, `customer_email` from Clerk. |
| Fulfilment | `app/api/webhooks/stripe/route.ts` | On `checkout.session.completed`: upsert `payments` row to `paid`, PostHog event, receipt email, referral credit. |
| Success | `success_url = /dashboard?paid=1` | Assumes the webhook already arrived. |

Current purchase path for a new visitor from an ad:

`landing → sign up (Clerk) → free mock test → try a 2nd test → redirected to /billing → tap Unlock → redirect to Stripe → tap Apple Pay → redirect back`

**Worth knowing:** hosted Stripe Checkout already shows Apple Pay and Google Pay when they're enabled in the Dashboard. So wallets may already work. The problem is that it takes two taps, a full page redirect, and a Stripe-branded page. That costs conversions on mobile ad traffic, and that's what this plan fixes.

---

## 2. Target experience

On `/billing` (and later on in-context upsell spots), show the native **Apple Pay / Google Pay / Link buttons inline**. One tap opens the wallet sheet, Face ID / fingerprint, done. The user stays on civicsstudy.com and lands on an "unlocked" screen.

Card payers keep a "Pay with card" option. Phase 1 points it at the existing hosted Checkout so nothing breaks.

---

## 3. Approach

Use Stripe's **Express Checkout Element** with the **Checkout Sessions API in `ui_mode: 'elements'`** (Stripe's currently recommended pairing; older docs call this `ui_mode: 'custom'`). We keep using Checkout Sessions, so we keep what we already rely on:

- `automatic_tax`
- the referral coupon and promotion codes
- the existing `checkout.session.completed` webhook

Payment Intents is not needed and would mean rebuilding tax and discounts ourselves.

---

## 4. Phases

### Phase 0: Stripe Dashboard setup (about 30 min, no code)

1. **Settings → Payment methods**: confirm Cards, Apple Pay, Google Pay and Link are on, in both sandbox and live.
2. **Settings → Payment method domains**: register `civicsstudy.com` in **both sandbox and live**. Required for Apple Pay, and Stripe also lists Google Pay and Link as needing it for Elements. No need for `www` because `next.config.ts` 308s it to the apex.
3. For testing, also register a stable HTTPS preview domain in sandbox (e.g. a fixed Vercel preview alias). Wallet buttons won't render on `localhost` or plain HTTP.
4. Quick sanity check: run today's hosted flow on an iPhone and on Android Chrome and confirm the wallet buttons show on the Stripe page. That gives a baseline.

### Phase 1: Inline express buttons on /billing (about 1–2 days)

**Packages / env**

- `npm i @stripe/stripe-js @stripe/react-stripe-js`
- New env var `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (doesn't exist yet). Add it to `scripts/setup-env.mjs` alongside the other Stripe vars, and to Vercel.

**Server**

1. `lib/stripe.ts`: one shared `new Stripe(secretKey)` plus the `getBaseUrl()` helper (currently inside the checkout route).
2. `app/api/checkout/route.ts`: accept `{ ui: 'elements' | 'hosted', referralCode }`.
   - `hosted` behaves exactly as today (card fallback).
   - `elements` creates the session with `ui_mode: 'elements'` and `return_url: ${base}/billing/complete?session_id={CHECKOUT_SESSION_ID}` instead of `success_url`/`cancel_url`, then returns `{ clientSecret: session.client_secret }`.
   - Same `metadata.userId`, `referralCode`, discounts, `automatic_tax`, `customer_email`, `locale` in both branches.
   - Before creating a session, short-circuit if the user is already `paid` (prevents double charges from a stale tab).
3. **Extract fulfilment into `lib/fulfill-checkout.ts`**, used by both the webhook and the return page. Make it idempotent on `session.id` (see Bug #1 below). Steps: retrieve the session, check `status === 'complete' && payment_status === 'paid'`, then upsert payment, send email, credit referral.
4. `app/(app)/billing/complete/page.tsx` (server component): read `session_id`, call `fulfillCheckout(sessionId)`, then show the "You're unlocked" state, or `redirect('/dashboard?paid=1')`. This removes the race where the user lands on the dashboard before the webhook arrives and still looks locked.

**Client**

5. `components/express-unlock.tsx` (reusable, so Phase 2 can drop it anywhere):
   - `loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)` at module scope.
   - `CheckoutElementsProvider` with `clientSecret` coming from a `fetch('/api/checkout', { ui: 'elements', referralCode })` promise, started on mount.
   - `<ExpressCheckoutElement onConfirm={e => checkout.confirm({ expressCheckoutConfirmEvent: e })} />`
   - `options`: `buttonType: { applePay: 'buy', googlePay: 'buy' }`, `buttonHeight: 55` to match the current CTA, `layout: { maxRows: 1 }` so only the best wallet shows.
   - `onAvailablePaymentMethodsChange`: if there are no wallets (desktop Firefox, etc.), hide the element and promote the card button to primary.
   - Show the price from `checkout.total` rather than the hardcoded string, so Stripe stays the source of truth.
6. `billing-content.tsx`: express buttons on top, then "or pay with card" (the current `CheckoutButton`, now posting `ui: 'hosted'`).
7. i18n: new keys in `en.json` and `es.json` (`orPayWithCard`, `unlockedTitle`, `paymentFailed`, …).

**Analytics** (`lib/analytics.ts` / PostHog), so we can measure the lift:

- `express_checkout_shown` with `{ wallets: ['apple_pay', …] }`
- `express_checkout_clicked` with `{ wallet }` (via `onClick`)
- `express_checkout_cancelled` (via `onCancel`)
- `express_checkout_confirm_failed` with `{ error_code }`
- `payment_completed` gets a `ui: 'elements' | 'hosted'` property (from session metadata) so the funnel splits by path.

### Phase 2: Put the button where intent peaks (about 1–2 days)

Making the button faster helps, but **where** it appears probably matters more for ad traffic:

1. **Mock test results screen** (`app/(app)/test/mock-test.tsx`, results view). Right now someone who just finished their free test sees no upsell; they only hit the paywall when they *try another test*. Put `<ExpressUnlock />` on the results screen when `!access` ("Practise unlimited mock tests before your interview. $12.99, one-time").
2. **Dashboard** upsell card for free users who've used their test.
3. **Progress page** currently does a hard `redirect('/billing')`. A blurred preview with an inline unlock may convert better. A/B test it with a PostHog flag.

### Phase 3 (optional, later): reduce sign-up friction

Right now you **must create a Clerk account before you can pay**. For cold ad traffic that's likely the biggest drop-off, bigger than the payment step. Options, cheapest first:

- Make Google / Apple social sign-in the default on the Clerk sign-up (one tap, pairs well with wallets).
- Let anonymous users do the free test (local progress already exists in `lib/local-progress.ts`), and only ask for sign-up at the unlock moment.
- True guest checkout (pay first, create account from the wallet email afterwards). Highest conversion but the most complex with Clerk. Only worth it once ads are running and the data shows the drop-off.

---

## 5. Bugs / gaps found along the way

1. **Webhook isn't idempotent.** Stripe retries webhooks. On a retry the referrer's `bonusTests` gets `+1` again and the receipt email is sent again. Fix: store `stripe_session_id` on `payments` (unique) or keep a `processed_events` table, and skip if already handled. This matters even more once the return page also triggers fulfilment.
2. **Docs and code disagree on the paywall switch.** `docs/launch-plan.md` says it's the PostHog `payment_enabled` flag; the code uses the `PAYMENT_REQUIRED` env var. Pick one (an env var is simpler and safer on the server) and update the doc.
3. **Price is hardcoded in two places** (`en.json` / `es.json` say $12.99, and `STRIPE_PRICE_ID` is in env). With Elements we can read the real total from the session. For the static copy, consider passing the price in from a single config value.
4. **No upsell after the free test** (see Phase 2.1).

---

## 6. Risks to check in sandbox

- **Automatic tax with wallets:** confirm tax is calculated from the wallet's billing address in `ui_mode: 'elements'`, and that the wallet sheet shows the right total. If it doesn't, the fallback is to drop `automatic_tax` for this digital product (check with your accountant) or collect a ZIP first.
- **iOS home-screen PWA:** test Apple Pay inside the installed PWA (`app/manifest.ts`), not just in Safari.
- **In-app browsers** (Instagram / Facebook ad clicks open in Meta's webview). Apple Pay often won't show there. The card fallback must stay visible, and it's worth tracking `wallets: []` rate by user agent.
- **Session pre-creation:** creating a Checkout Session every time `/billing` loads is fine (they expire after 24h) but adds Stripe API calls. If that becomes noisy, create it on first visible render of the component.

---

## 7. Test checklist

- [ ] iPhone Safari: Apple Pay button shows, completes, lands unlocked
- [ ] iPhone installed PWA: same
- [ ] Android Chrome: Google Pay shows, completes
- [ ] Desktop Chrome with a saved Google Pay card: Google Pay / Link shows
- [ ] Desktop Firefox: no wallets, so the card button is primary and hosted flow works
- [ ] Instagram in-app browser: fallback visible
- [ ] Referral code in localStorage: coupon applied to the wallet total
- [ ] Wallet cancelled: back to billing, no error, `express_checkout_cancelled` fired
- [ ] Declined card in wallet: friendly error shown
- [ ] Webhook delivered twice: only one email, referral credited once
- [ ] Return page before webhook: user is still unlocked immediately
- [ ] Already-paid user opens /billing: no new session, sent to dashboard
- [ ] Spanish locale strings

---

## 8. Pricing setup (price testing)

One product, five one-time USD prices, selected by `lookup_key` instead of the single `STRIPE_PRICE_ID` env var:

| lookup_key | Amount |
|---|---|
| `full_access_999` | $9.99 |
| `full_access_1299` | $12.99 |
| `full_access_1499` | $14.99 |
| `full_access_1999` | $19.99 |
| `full_access_2999` | $29.99 |

- **Test mode:** created 7 Nov 2026 on product `prod_VaUXlau3fzHemP` ("Civics Study: Full Access").
- **Live:** not yet created (the Stripe connection lacks live write permission). Create the same product and lookup keys in the Dashboard, or grant write access and rerun.
- **Code change:** `/api/checkout` reads a PostHog multivariate flag (e.g. `price_test`) server-side for the user, maps the variant to a lookup key, and calls `stripe.prices.list({ lookup_keys: [key] })`. Never accept a price from the client. Store the variant in session metadata so `payment_completed` can be split by price.
- **Display:** `/billing` and the express button show the price from the session (`checkout.total`) or from the resolved price, not the hardcoded `$12.99` in `messages/*.json`.
- **Judge on revenue per visitor**, not conversion rate. Run 2 arms at a time at low ad budgets.
- **Live webhook:** still needed at `https://civicsstudy.com/api/webhooks/stripe` for `checkout.session.completed` (plus `async_payment_succeeded` / `async_payment_failed`). Copy its signing secret into Vercel as `STRIPE_WEBHOOK_SECRET`.

---

## 9. Suggested order

1. Phase 0 Dashboard setup, and fix Bug #1 (idempotent fulfilment). Small, and it's needed first either way.
2. Phase 1 express buttons on `/billing`, behind a `express_checkout` PostHog flag so it can be rolled back instantly.
3. Phase 2.1 results-screen upsell.
4. Turn on `PAYMENT_REQUIRED`, start ads, watch the PostHog funnel split by `ui`, then decide on Phase 3.
