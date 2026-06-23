# US Civics Study App

A calm, oral-style study app for the 2025 USCIS naturalization civics test. 128
official questions, mock test mode, progress tracking, PWA install.

## Stack

- Next.js 16 (App Router, TypeScript, Turbopack)
- Clerk — authentication
- Neon Postgres + Drizzle ORM — persistence
- Tailwind CSS v4 — styling
- PostHog — product analytics
- Sentry — error tracking
- PWA — `app/manifest.ts` + `public/sw.js` (Next.js 16 native)

All third-party services were provisioned with the
[Stripe Projects CLI](https://docs.stripe.com/stripe-cli). See `AGENTS.md`.

## Local development

```bash
# 1. Pull credentials managed by Stripe Projects into .env
stripe projects env --pull --yes

# 2. Derive Clerk + DATABASE_URL + PostHog + Sentry vars into .env.local
npm run setup:env

# 3. Push the Drizzle schema to Neon (first time only)
npm run db:push

# 4. Run the dev server
npm run dev
```

Open <http://localhost:3000>.

## Routes

| Route                         | Purpose                                |
| ----------------------------- | -------------------------------------- |
| `/`                           | Public landing page                    |
| `/sign-in`, `/sign-up`        | Clerk auth (catch-all)                 |
| `/dashboard`                  | Progress summary + study mode picker   |
| `/study`                      | Core oral-style study session          |
| `/study?mode=starred`         | 20 starred (65/20) questions only      |
| `/study?mode=weak`            | Questions you marked needs-practice    |
| `/study?category=Symbols`     | Specific category                      |
| `/test`                       | Mock test, 20 random questions, 12+ to pass |
| `/progress`                   | All 128 with status, filters, reset    |
| `/api/progress`               | `GET`/`POST`/`DELETE` per-user state   |

## Database

```sql
-- db/schema.ts → db/migrations/0000_*.sql
progress(
  id serial primary key,
  user_id text not null,            -- Clerk user id
  question_id integer not null,     -- 1..128
  status text not null default 'unseen',  -- confident | needs_practice | unseen
  times_correct integer not null default 0,
  times_incorrect integer not null default 0,
  last_reviewed timestamp,
  unique(user_id, question_id)
)
```

## Local Stripe webhook

Stripe webhooks don't reach `localhost` on their own. Use the Stripe CLI to forward them during development:

```bash
# 1. Authenticate (one-time)
stripe login

# 2. Forward webhook events to the local handler
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# The CLI prints a signing secret — copy it into .env.local:
# STRIPE_WEBHOOK_SECRET=whsec_...

# 3. In a separate terminal, trigger a test payment to verify the full flow
stripe trigger payment_intent.succeeded
```

The webhook handler at `/api/webhooks/stripe` listens for `checkout.session.completed`, updates the `payments` table, and sends the receipt email.

To test the full checkout flow end-to-end in the browser, use Stripe's test card `4242 4242 4242 4242` with any future expiry and any 3-digit CVC.

## Deploy (Vercel, manual)

1. Push this repo to GitHub.
2. Import it in Vercel and pick the framework as **Next.js**.
3. In Vercel project settings → Environment Variables, paste:

   ```
   DATABASE_URL=…                         # from .env.local
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=…
   CLERK_SECRET_KEY=…
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
   NEXT_PUBLIC_POSTHOG_KEY=…
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   NEXT_PUBLIC_SENTRY_DSN=…
   SENTRY_DSN=…
   SENTRY_ORG=…
   SENTRY_PROJECT=…
   SENTRY_AUTH_TOKEN=…   # Vercel-only secret, used by source map upload
   ```

4. Trigger a deploy.

For Clerk production keys (pk_live\_…), provision a Clerk app with a
`production_domain` via `stripe projects add clerk/auth --config '{"production_domain":"yourdomain.com"}'`
and use those values instead.

## Analytics events

| Event                    | Properties                          |
| ------------------------ | ----------------------------------- |
| `study_session_started`  | `mode`, `count`                     |
| `question_answered`      | `question_id`, `status`, `category` |
| `mock_test_completed`    | `total`, `correct`, `passed`        |

## Offline support

`/data/questions.json` is precached by the service worker, so study sessions
work without a network connection. Progress updates fall back to `localStorage`
and replay to `/api/progress` next time you're online (see
`components/offline-sync.tsx`).
