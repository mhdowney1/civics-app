import { Resend } from 'resend'

const FROM = 'US Civics Study <hello@mail.civicsstudy.com>'
const BASE_URL = 'https://civicsstudy.com'

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  const resend = getResend()
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set; skipping email to', to)
    return
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html, ...(replyTo ? { replyTo } : {}) })
  } catch (err) {
    console.error('[email] Failed to send to', to, err)
  }
}

function base(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>US Civics Study</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="background:#0f0f0f;padding:24px 32px;">
            <span style="color:#4ade80;font-size:13px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;">● US Civics Study</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e5e5e5;">
            <p style="margin:0;color:#999;font-size:12px;line-height:1.5;">
              civicsstudy.com — Free civics test prep for the USCIS naturalization interview.<br/>
              Not affiliated with USCIS. <a href="${BASE_URL}/sign-in" style="color:#999;">Manage account</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background:#4ade80;border-radius:8px;">
        <a href="${url}" style="display:inline-block;padding:14px 28px;color:#0f0f0f;font-weight:700;font-size:15px;text-decoration:none;">${text}</a>
      </td>
    </tr>
  </table>`
}

export function welcomeEmail(firstName: string | null): string {
  const name = firstName ?? 'there'
  return base(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#0f0f0f;line-height:1.2;">Hi ${name} 👋</h1>
    <p style="margin:0 0 20px;color:#444;font-size:16px;line-height:1.6;">You're all set to start studying for the US citizenship civics test.</p>
    <p style="margin:0 0 20px;color:#444;font-size:16px;line-height:1.6;">The best way to start: go through all 128 questions once, marking each as "got it" or "needs practice." It takes about 20–30 minutes and gives you a clear picture of where you stand.</p>
    ${btn('Start studying now →', `${BASE_URL}/dashboard`)}
    <p style="margin:0;color:#999;font-size:14px;line-height:1.6;"><strong style="color:#444;">Tip:</strong> The test is oral — an officer asks you questions and you answer out loud. This app is built to mimic that exact format.</p>
  `)
}

export function nudgeEmail(firstName: string | null): string {
  const name = firstName ?? 'there'
  return base(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#0f0f0f;line-height:1.2;">Quick check-in, ${name}</h1>
    <p style="margin:0 0 20px;color:#444;font-size:16px;line-height:1.6;">Have you tried the mock test yet? It's 20 questions — the same format as the real USCIS interview. You need 12 right to pass.</p>
    <p style="margin:0 0 20px;color:#444;font-size:16px;line-height:1.6;">Your first mock test is free. Give it a try and see exactly where you stand before the real thing.</p>
    ${btn('Take the mock test →', `${BASE_URL}/test`)}
    <p style="margin:0;color:#999;font-size:14px;line-height:1.6;">Already studied? Great — keep going. The more you practice, the more confident you'll feel walking into that interview.</p>
  `)
}

export function reEngagementEmail(firstName: string | null): string {
  const name = firstName ?? 'there'
  return base(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#0f0f0f;line-height:1.2;">Your prep is waiting, ${name}</h1>
    <p style="margin:0 0 20px;color:#444;font-size:16px;line-height:1.6;">It's been a few days since you last studied. Even 5 minutes of practice today keeps the questions fresh in your mind.</p>
    <p style="margin:0 0 20px;color:#444;font-size:16px;line-height:1.6;">The USCIS interview isn't just about knowing the answers — it's about being able to recall them calmly under pressure. Daily practice makes that easy.</p>
    ${btn('Resume studying →', `${BASE_URL}/dashboard`)}
    <p style="margin:0;color:#999;font-size:14px;line-height:1.6;">You've already put in the work to sign up. Don't let that effort go to waste — 5 minutes a day is all it takes to stay sharp.</p>
  `)
}

export function studyTipEmail(firstName: string | null): string {
  const name = firstName ?? 'there'
  return base(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#0f0f0f;line-height:1.2;">A few things to help you pass, ${name}</h1>
    <p style="margin:0 0 16px;color:#444;font-size:16px;line-height:1.6;">You've been at this for a couple of weeks. Here are the most important things to know before your interview:</p>
    <ul style="margin:0 0 20px;padding-left:20px;color:#444;font-size:16px;line-height:1.8;">
      <li><strong>The officer asks up to 10 questions</strong> — you need 6 correct to pass (60%).</li>
      <li><strong>Any acceptable answer counts</strong> — most questions have multiple valid answers.</li>
      <li><strong>The test stops early</strong> — once you hit 6 correct, you pass right there.</li>
      <li><strong>Speak clearly and confidently</strong> — it's okay to pause before answering.</li>
    </ul>
    ${btn('Take a mock test →', `${BASE_URL}/test`)}
    <p style="margin:0;color:#999;font-size:14px;line-height:1.6;">Unlimited mock tests are available for a one-time $10 unlock — no subscription, no recurring charges.</p>
  `)
}

export function contactFormEmail(userEmail: string, message: string): string {
  return base(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f0f0f;line-height:1.2;">New message from a user</h1>
    <p style="margin:0 0 20px;color:#999;font-size:14px;">From: <strong style="color:#444;">${userEmail}</strong></p>
    <div style="background:#f9f9f9;border-radius:8px;padding:20px 24px;margin:0 0 20px;">
      <p style="margin:0;color:#333;font-size:15px;line-height:1.7;white-space:pre-wrap;">${message}</p>
    </div>
    <p style="margin:0;color:#999;font-size:13px;">Reply to this email to respond directly to the user.</p>
  `)
}

export function paymentReceiptEmail(firstName: string | null): string {
  const name = firstName ?? 'there'
  return base(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#0f0f0f;line-height:1.2;">You're unlocked, ${name} ✓</h1>
    <p style="margin:0 0 20px;color:#444;font-size:16px;line-height:1.6;">Your one-time payment is confirmed. You now have unlimited access to mock tests — take as many as you need until you feel completely ready.</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;background:#f9f9f9;border-radius:8px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 8px;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:0.1em;">What's included</p>
        <ul style="margin:0;padding-left:20px;color:#333;font-size:15px;line-height:2;">
          <li>Unlimited mock tests</li>
          <li>Detailed progress analytics</li>
          <li>All 128 official USCIS questions</li>
          <li>Works offline, no subscription</li>
        </ul>
      </td></tr>
    </table>
    ${btn('Go to dashboard →', `${BASE_URL}/dashboard`)}
    <p style="margin:0;color:#999;font-size:14px;line-height:1.6;">Good luck with your interview. You've got this.</p>
  `)
}
