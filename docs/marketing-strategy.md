# civicsstudy.com — Sales & Marketing Strategy

Full 5-priority marketing plan. Priorities 1–3 are already built and committed.

---

## What's already built (Priorities 1–3)

### Priority 1 — Email Automation ✅
Fully automated email sequences that run without any manual work.

**How it works:**
1. User signs up → Clerk fires webhook → `/api/webhooks/clerk`
   - Welcome email sent immediately via Resend
   - "Nudge" email (day +2) and "Study tip" email (day +14) queued in `email_sequences` table
2. Vercel Cron (daily 14:00 UTC) → `/api/cron/email-sequences` — sends queued emails
3. Vercel Cron (daily 15:00 UTC) → `/api/cron/re-engagement` — finds users inactive 3–30 days, sends re-engagement email
4. Stripe webhook → sends payment receipt email on successful payment

**To activate:**
- [ ] Create [Resend](https://resend.com) account → add `civicsstudy.com` domain → verify DNS in Cloudflare
- [ ] Add `RESEND_API_KEY` to Vercel env: `vercel env add RESEND_API_KEY production`
- [ ] In Clerk dashboard → Webhooks → Add endpoint: `https://civicsstudy.com/api/webhooks/clerk` → subscribe to `user.created`
- [ ] Add `CLERK_WEBHOOK_SECRET` to Vercel env: `vercel env add CLERK_WEBHOOK_SECRET production`
- [ ] Run `npm run db:push` in your terminal to create the new DB tables (`users_meta`, `email_sequences`, `referrals`)

**Files:** `lib/email.ts`, `app/api/webhooks/clerk/route.ts`, `app/api/cron/email-sequences/route.ts`, `app/api/cron/re-engagement/route.ts`

---

### Priority 2 — SEO Content Machine ✅
128 statically generated pages — one per civics question — targeting long-tail search queries like "what is the supreme law of the land uscis" etc. Zero ongoing work; content comes from the existing `questions.json`.

**New routes:**
- `/civics-questions` — index of all 128 questions by category
- `/civics-questions/[1–128]` — individual question pages with official answers, JSON-LD Question/Answer schema, and sign-up CTA
- Each question page has its own OG image (1200x630)
- Sitemap updated to include all 129 new URLs

**To activate:**
- [ ] Submit sitemap to [Google Search Console](https://search.google.com/search-console): `https://civicsstudy.com/sitemap.xml`
- [ ] Submit to [Bing Webmaster Tools](https://www.bing.com/webmasters)
- Builds and deploys automatically with each Vercel deploy

---

### Priority 3 — Referral & Share Loop ✅
Viral growth loop — users share their score after the mock test. Referred signups get 1 bonus mock test.

**How it works:**
1. After mock test, "Share your score →" button appears
2. Clicking it calls `/api/referral` (GET) to fetch the user's unique ref code
3. Share URL: `civicsstudy.com/results?score=18&total=20&ref=abc123`
4. The `/results` page shows the score card with OG image and sign-up CTAs
5. When a new visitor lands on the homepage with `?ref=abc123`, `CaptureRefParam` saves it to localStorage
6. After they sign up and hit the dashboard, `ProcessReferral` posts the code to `/api/referral` (POST), creating the referral record and granting 1 bonus test

**Files:** `components/share-score.tsx`, `app/results/page.tsx`, `app/api/og/result/route.tsx`, `app/api/referral/route.ts`

---

## Still to build (Priorities 4–5)

### Priority 4 — Social Media Automation
Daily "question of the day" posts to Twitter/X, Instagram, Facebook — fully automated via Vercel Cron.

**What to build:**

1. Create [Buffer](https://buffer.com) account
   - Connect Twitter/X page, Instagram page, Facebook page
   - Get `BUFFER_ACCESS_TOKEN` (Settings → Apps → Access Token)
   - Get channel IDs for each platform from Buffer API or dashboard
   - Add to Vercel: `BUFFER_ACCESS_TOKEN`, `BUFFER_CHANNEL_IDS` (comma-separated)

2. Create `/app/api/cron/social-post/route.ts`:
   ```ts
   // Picks question by day-of-year (deterministic, cycles through all 128)
   // Skips variable:true questions
   // POSTs to Buffer API to schedule the post
   // Post format:
   // "Today's civics question:
   //
   // [QUESTION TEXT]?
   //
   // Answer: [ANSWER]
   //
   // Practice all 128 official questions free → civicsstudy.com
   //
   // #USCitizenship #USCIS #Civics #Naturalization"
   ```

3. Add to `vercel.json` crons:
   ```json
   { "path": "/api/cron/social-post", "schedule": "0 12 * * *" }
   ```

**Buffer API docs:** https://buffer.com/developers/api/updates  
**Estimated effort:** 2–3 hours

---

### Priority 5 — Google Ads (Paid Acquisition)
One-time setup in Google Ads dashboard. The algorithm runs it automatically after setup.

**Setup steps:**

1. Create a Google Ads account at ads.google.com
2. Add conversion tracking:
   - Install Google tag (`gtag.js`) in `app/layout.tsx`
   - Set up conversion: "User signs up" = page load on `/dashboard` after new signup
   - Set up conversion: "Purchase" = Stripe success redirect (or use Google's purchase conversion)

3. Create campaign:
   - Type: Search
   - Goal: Conversions
   - Budget: Start at **$5/day** ($150/month)
   - Bidding: **Maximize Conversions** (switch to Target CPA ~$5 once you have 30+ conversions)
   - Location: United States
   - Language: English (also add Spanish if you want to reach Spanish-speaking immigrants)

4. Ad groups and keywords:

   | Ad group | Match type | Keywords |
   |----------|------------|---------|
   | Core intent | Broad match | `uscis civics test practice`, `citizenship test questions 2026`, `naturalization civics study` |
   | Interview prep | Phrase | `"how to prepare for uscis interview"`, `"uscis civics interview questions"` |
   | 65/20 seniors | Exact | `[65 20 rule citizenship]`, `[senior citizenship test exemption]` |
   | Brand | Exact | `[civics study app]`, `[civics test app]` |

5. Responsive Search Ad copy:

   **Headlines (mix and match, 3 shown at a time):**
   - Free Civics Test Practice
   - 128 Official USCIS Questions
   - Oral-Style Practice App
   - Works Offline Anytime
   - $10 Unlocks Everything
   - Calm, No-Clutter Study App
   - Practice Like the Real Interview
   - Pass Your Citizenship Test

   **Descriptions:**
   - Calm, oral-style practice for your USCIS interview. Free to study. No subscription ever.
   - Practice the way you'll be tested. 128 official questions. Mock tests. Progress tracking.
   - Study all 128 USCIS civics questions free. $10 one-time for unlimited mock tests.

6. Display URL: `civicsstudy.com/study`

7. **Monthly maintenance:** Check CPA and pause ad groups spending >$10/conversion. No other manual work.

---

## Addressable market & unit economics

- **~800,000 USCIS naturalizations per year** in the US (source: USCIS data)
- **Conversion target:** 1% of visitors pay = 1 paying user per 100 visitors
- **Google Ads:** $5/day budget, ~$1 CPC = 5 visitors/day → 0.05 paying users/day at 1% = ~18 paying users/month = $180 revenue from $150 spend
- **Organic (SEO):** Compounds over 6–18 months; no ongoing cost
- **Email:** Converts free users who signed up but didn't pay; pure margin
- **Referral:** Every paying user shares = potential additional free signups

---

## Key env vars to add for full automation

| Var | Where to get it | Vercel command |
|-----|----------------|----------------|
| `RESEND_API_KEY` | resend.com → API Keys | `vercel env add RESEND_API_KEY production` |
| `CLERK_WEBHOOK_SECRET` | Clerk dashboard → Webhooks → signing secret | `vercel env add CLERK_WEBHOOK_SECRET production` |
| `BUFFER_ACCESS_TOKEN` | buffer.com → Settings → Apps | `vercel env add BUFFER_ACCESS_TOKEN production` |
| `BUFFER_CHANNEL_IDS` | Buffer API or dashboard | `vercel env add BUFFER_CHANNEL_IDS production` |
