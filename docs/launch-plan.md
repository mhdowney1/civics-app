# Launch Plan: Public Release

## Context
Soft-launching to family, friends, and Reddit threads where people ask about the USCIS civics test. Goal is user feedback before monetizing. Two success signals: user completes all 128 questions, user takes 1+ mock tests. PostHog surveys capture feedback at those moments. Stripe stays off until feedback validates the app.

---

## Auth friction

**Decision: Allow anonymous study, gate at mock test.**

Reddit visitors are motivated (real exam coming) but don't know the app — requiring sign-up before seeing a single question is a drop-off point. The `/study` page has no explicit auth guard (progress silently doesn't save without auth). The current landing page CTA routes directly to sign-up, which is the problem.

Changes:
- Add a "Try it — no account needed" CTA on the landing page linking to `/study` directly.
- In `StudySession`, show a dismissible banner: "Sign up to save your progress" — only when no Clerk userId is present.
- Keep the mock test (`/test`) requiring auth — that's the natural conversion moment.

---

## Stripe paywall

No code changes needed. Turn off the `payment_enabled` feature flag in the PostHog dashboard. `lib/server-access.ts` already defaults to full access when the flag is off.

---

## PostHog surveys

Two surveys created in PostHog dashboard, triggered programmatically:

**Survey 1 — after first mock test completed** (`app/(app)/test/mock-test.tsx`)
- Question: "Did this app help you feel ready for your test? What would make it better?"
- Type: open text + 1–5 rating

**Survey 2 — after all 128 questions answered** (`app/(app)/study/study-session.tsx`)
- Triggered in `SessionSummary` when `total === 128`
- Question: "You just went through all 128 questions — what did you think? Anything missing?"
- Type: open text

---

## Custom domain

1. Purchase domain
2. Vercel project → Settings → Domains → add domain
3. Point DNS to Vercel
4. TLS auto-provisioned

---

## PostHog flag to flip before launch

- `payment_enabled` → OFF (everyone gets full access)
