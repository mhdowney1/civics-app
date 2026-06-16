<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- stripe-projects-cli managed:agents-md:start -->
## Stripe Projects CLI

This repository is initialized for the Stripe project "civics-app".

## Tools used

- [Stripe CLI](https://docs.stripe.com/stripe-cli) with the `projects` plugin to manage third-party services, credentials, and deployments for this project. Use the stripe-projects-cli to manage deploying and access to third party services.
<!-- stripe-projects-cli managed:agents-md:end -->

---

## Environment variables

There are two setup scripts — use the right one:

| Command | Output file | Clerk keys | Use when |
|---|---|---|---|
| `npm run setup:env` | `.env.local` | `pk_test_` (dev) | Local development |
| `npm run setup:env:prod` | `.env.production.local` | `pk_live_` (prod) | Pushing to Vercel production |

**Always use `setup:env:prod` when updating Vercel production env vars.** Using `setup:env` by mistake deploys dev Clerk keys, which shows "Development mode" on the sign-in page.

Workflow for updating Vercel production credentials:
```bash
stripe login                        # ensure live mode auth
stripe projects env --pull --yes    # pull latest credentials into .env
npm run setup:env:prod              # derive prod keys into .env.production.local
# then push changed vars via `vercel env add ... production`
```

---

## Custom domain launch checklist

Use this checklist when launching a new app or moving an existing app to a custom domain. Order matters.

### 1. Buy the domain first
Purchase the domain before running `stripe projects add clerk/auth`. The Clerk production instance must be provisioned with the real domain — if it is provisioned with a `.vercel.app` URL, Clerk will reject attempts to update it later and the instance must be destroyed and recreated (losing all user data).

```bash
stripe projects add clerk/auth --name <resource-name> \
  --config '{"app_name": "<app>", "production_domain": "<yourdomain.com>"}'
```

### 2. Configure Vercel domains
In Vercel → project → Settings → Domains, add both the apex and www variants. Set them up as:
- `yourdomain.com` → **Production** (primary, no redirect)
- `www.yourdomain.com` → **308 redirect to `yourdomain.com`**

If Vercel redirects the apex to www (or vice versa) while Next.js redirects the opposite direction, you get an infinite redirect loop (`ERR_TOO_MANY_REDIRECTS`). Always confirm the redirect direction matches `next.config.ts`.

### 3. Add Clerk DNS records in Cloudflare
After provisioning the Clerk production instance, Clerk requires five CNAME records. Add them in Cloudflare → DNS → Records. **All must be DNS-only (grey cloud — not proxied):**

| Name | Target |
|---|---|
| `accounts` | `accounts.clerk.services` |
| `clerk` | `frontend-api.clerk.services` |
| `clk._domainkey` | `dkim1.<clerk-instance-id>.clerk.services` |
| `clk2._domainkey` | `dkim2.<clerk-instance-id>.clerk.services` |
| `clkmail` | `mail.<clerk-instance-id>.clerk.services` |

The exact values come from Clerk dashboard → Configure → Domains. After adding, click Re-verify in Clerk.

### 4. Push all required production env vars to Vercel
These are commonly missed for production (they exist in dev only by default):

```bash
echo "/sign-in" | vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production
echo "/sign-up" | vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production
echo "/dashboard" | vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL production
echo "/dashboard" | vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL production
```

Without `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, clicking "Sign up" redirects users to `accounts.<yourdomain.com>` (Clerk's hosted portal) instead of the in-app `/sign-up` page with the custom theme.

### 5. Enable OAuth providers in Clerk dashboard
The new production Clerk instance starts with no OAuth providers. Re-enable Google (and any others) under Configure → SSO connections.

### 6. Run a local production build before deploying
```bash
npm run build
```
This catches pre-render errors (e.g. OG image bugs) before they cause a failed Vercel deployment. The `@vercel/og` image renderer requires every `<div>` with multiple children to have an explicit `display: flex`, `display: contents`, or `display: none` style.

---

## Cloudflare + Vercel notes

- All Vercel-pointed DNS records (A / CNAME for the apex and www) must be **DNS-only (grey cloud)**. Cloudflare proxying conflicts with Vercel's SSL certificate provisioning.
- Clerk DNS records (accounts, clerk, clk._domainkey, etc.) must also be DNS-only.
- Do not add Cloudflare redirect rules or page rules for domains handled by Vercel — use Next.js rewrites/redirects in `next.config.ts` instead, or Vercel's domain settings. Duplicate redirect rules cause loops.
