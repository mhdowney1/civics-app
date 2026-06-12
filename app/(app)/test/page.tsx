import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { QUESTIONS, shuffle } from '@/lib/questions'
import { getTestAccess, stampFreeTestUsed } from '@/lib/server-access'
import { MockTest } from './mock-test'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mock test · US Civics Study' }

export default async function TestPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { access, freeRemaining } = await getTestAccess(userId)

  if (!access && !freeRemaining) {
    redirect('/billing')
  }

  if (!access && freeRemaining) {
    await stampFreeTestUsed(userId)
  }

  const sample = shuffle(QUESTIONS).slice(0, 20)
  return <MockTest questions={sample} />
}
