import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { QUESTIONS } from '@/lib/questions'
import { getServerProgress } from '@/lib/server-progress'
import { hasAccess } from '@/lib/server-access'
import { ProgressView } from './progress-view'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Progress · Civics Study' }

export default async function ProgressPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  if (!(await hasAccess(userId))) {
    redirect('/billing')
  }

  const progress = await getServerProgress()
  return <ProgressView questions={QUESTIONS} initialProgress={progress} />
}
