import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { sendEmail, contactFormEmail } from '@/lib/email'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message } = await req.json() as { message?: string }
  if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

  const user = await currentUser()
  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? 'unknown'

  await sendEmail(
    'mhdowney1@gmail.com',
    `Contact from ${userEmail}`,
    contactFormEmail(userEmail, message.trim()),
    userEmail,
  )

  return NextResponse.json({ ok: true })
}
