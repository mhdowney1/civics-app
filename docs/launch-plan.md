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

## Feedback collection

### In-app FeedbackPrompt (custom component — `components/feedback-prompt.tsx`)

Three triggers, each showing a 1–5 star rating + open text comment. Fires `user_feedback_submitted` event to PostHog with `rating`, `comment`, and `trigger` properties.

| Trigger | When | File |
|---|---|---|
| `session_end` | After any study session with ≥10 questions answered. Gated by `localStorage` flag `feedback_session_shown` — shows once per device. | `app/(app)/study/study-session.tsx` |
| `all_128` | After all 128 questions have been answered in a session. | `app/(app)/study/study-session.tsx` |
| `mock_test` | After mock test completes (pass or fail). | `app/(app)/test/mock-test.tsx` |

Each trigger uses distinct prompt text — see `PROMPTS` map in `feedback-prompt.tsx`.

### PostHog native surveys (dashboard — live)

Two floating modal surveys built and launched in PostHog:

**Survey A — Returning user NPS**
- Targeting: users who have triggered `study_session_started` ≥ 2 times
- Display: floating modal, 30s delay into session, shown once per user
- Questions: NPS 0–10 + "What's one thing we should improve?" (open text)

**Survey B — Feature-specific (post mock test)**
- Targeting: users who have triggered `mock_test_completed` at least once
- Display: floating modal, shown once per user
- Questions: "How was the audio voice?" (multiple choice) + "What would make this app a must-have before your test?" (open text)

---

## Custom domain

1. Purchase domain
2. Vercel project → Settings → Domains → add domain
3. Point DNS to Vercel
4. TLS auto-provisioned

---

## PostHog flag to flip before launch

- `payment_enabled` → OFF (everyone gets full access)
