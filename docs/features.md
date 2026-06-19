# CivicsStudy.com — Feature Tracker

## Core Study Experience

| Feature | Status | Notes |
|---|---|---|
| 128 USCIS questions (2025 format) | ✅ Live | Covers all questions from the Oct 2025 test overhaul |
| Study mode with self-grading | ✅ Live | "Got it" / "Need more practice" per question |
| 65/20 starred questions | ✅ Live | Flags questions eligible for the 65+ simplified test |
| "Show first answer only" toggle | ✅ Live | Defaults to one answer (real test behaviour); expand to see all |
| Mock test mode | ✅ Live | 20 random questions, pass threshold 12/20 |
| Mock test history | ✅ Live | Stores past test scores |

## Audio

| Feature | Status | Notes |
|---|---|---|
| ElevenLabs TTS — question read-aloud | ✅ Live | Brian voice; blob-cached per session; fallback to browser TTS |
| TTS in mock test | ✅ Live | Speaker button now present in both study and mock test |
| Spanish TTS | ✅ Live | Set `ELEVENLABS_VOICE_ID_ES` env var to a Latin American Spanish voice; falls back to EN voice if unset |

## Personalized Answers

| Feature | Status | Notes |
|---|---|---|
| Current national officials | ✅ Live | Q30 Speaker, Q38 President, Q39 VP, Q57 Chief Justice updated in questions.json |
| ZIP → state senators | ✅ Live | Google Civic Information API; cached in localStorage |
| ZIP → U.S. representative | ✅ Live | Congressional district lookup via ZIP |
| ZIP → governor | ✅ Live | State-level lookup |
| ZIP → state capital | ✅ Live | Static lookup from state code |

## Progress & Sync

| Feature | Status | Notes |
|---|---|---|
| Progress tracking (per question) | ✅ Live | Stored in Neon/Drizzle via `/api/progress` |
| Offline-first progress | ✅ Live | Writes to localStorage queue; flushes on reconnect |
| PWA / service worker | ✅ Live | Precaches questions.json; works offline |

## Localization

| Feature | Status | Notes |
|---|---|---|
| EN/ES toggle in nav | ✅ Live | Persisted in `civics:language` cookie; soft RSC refresh on toggle (no full reload) |
| Spanish question text + answers | ✅ Live | All 128 questions have `questionEs` / `answersEs` in `data/questions.json` |
| Full app UI in Spanish | ✅ Live | All authenticated pages (dashboard, study, mock test, progress, billing, history) via next-intl v4; Latin American Spanish |
| Category names translated | ✅ Live | All 8 USCIS category names translated in dashboard, study, mock test, and progress views |
| Spanish TTS (ElevenLabs) | ✅ Live | Separate voice via `ELEVENLABS_VOICE_ID_ES`; browser TTS fallback uses `es-US` locale |
| Public pages in Spanish | ⬜ Not started | Landing page, `/civics-questions/*`, `/results` — kept English for SEO |

## Engagement

| Feature | Status | Notes |
|---|---|---|
| Confetti on completion | ✅ Live | Green/white/black; fires on study session end and mock test pass |
| Score sharing | ✅ Live | Share mock test results |
| Feedback prompts | ✅ Live | Shown after full 128-question session and mock test |

## Auth & Billing

| Feature | Status | Notes |
|---|---|---|
| Sign in / sign up (Clerk) | ✅ Live | Google SSO + email; production domain civicsstudy.com |
| One-time payment (Stripe) | ✅ Live | $10 lifetime access via `/billing` |
| Progress only saved when signed in | ✅ Live | Banner shown to guests with sign-up CTA |

## Observability

| Feature | Status | Notes |
|---|---|---|
| PostHog analytics | ✅ Live | `study_session_started`, `question_answered`, `mock_test_completed` events |
| Sentry error tracking | ✅ Live | Client + server + edge configs |

## Planned / Not Started

| Feature | Priority | Notes |
|---|---|---|
| AI oral coach (voice input + feedback) | P3 | User speaks answer aloud; AI grades accuracy |
| B2B / institutional licenses | P3 | Bulk access for nonprofits, libraries, legal aid orgs |
