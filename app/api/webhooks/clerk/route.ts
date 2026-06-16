import { Webhook } from 'svix'
import { NextResponse } from 'next/server'
import { db } from '@/db/client'
import { usersMeta, emailSequences } from '@/db/schema'
import { sendEmail, welcomeEmail } from '@/lib/email'

function generateReferralCode(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 10)
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

interface ClerkEmailAddress {
  email_address: string
  id: string
}

interface ClerkUserCreatedEvent {
  type: 'user.created'
  data: {
    id: string
    email_addresses: ClerkEmailAddress[]
    first_name: string | null
    last_name: string | null
  }
}

type ClerkEvent = ClerkUserCreatedEvent | { type: string }

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const body = await req.text()
  const svixId = req.headers.get('svix-id') ?? ''
  const svixTimestamp = req.headers.get('svix-timestamp') ?? ''
  const svixSignature = req.headers.get('svix-signature') ?? ''

  const wh = new Webhook(secret)
  let event: ClerkEvent
  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkEvent
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'user.created') {
    return NextResponse.json({ received: true })
  }

  const { id: userId, email_addresses, first_name } = (event as unknown as ClerkUserCreatedEvent).data
  const email = email_addresses[0]?.email_address
  if (!userId || !email) {
    return NextResponse.json({ error: 'Missing user data' }, { status: 400 })
  }

  const referralCode = generateReferralCode()
  const now = new Date()

  await db.insert(usersMeta).values({
    userId,
    email,
    firstName: first_name,
    referralCode,
  }).onConflictDoNothing()

  await db.insert(emailSequences).values([
    { userId, type: 'nudge', scheduledFor: addDays(now, 2) },
    { userId, type: 'study_tip', scheduledFor: addDays(now, 14) },
  ])

  await sendEmail(email, 'You\'re all set — start studying for your civics test', welcomeEmail(first_name))

  return NextResponse.json({ received: true })
}
