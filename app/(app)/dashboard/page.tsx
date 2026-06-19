import { auth, currentUser } from '@clerk/nextjs/server'
import { CATEGORIES } from '@/lib/types'
import {
  QUESTIONS,
  STARRED_QUESTIONS,
  TOTAL_QUESTIONS,
} from '@/lib/questions'
import { getServerProgress } from '@/lib/server-progress'
import { getRecentTests } from '@/lib/server-tests'
import { isPaid } from '@/lib/server-access'
import { DashboardUI } from './dashboard-ui'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dashboard · US Civics Study' }

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string }>
}) {
  const [{ userId }, { paid: paidParam }] = await Promise.all([auth(), searchParams])
  const [user, progress, paid, recentTests] = await Promise.all([
    currentUser(),
    getServerProgress(),
    userId ? isPaid(userId) : Promise.resolve(false),
    getRecentTests(3),
  ])

  const byId = new Map(progress.map((p) => [p.questionId, p]))
  const studied = progress.filter((p) => p.status !== 'unseen').length
  const confident = progress.filter((p) => p.status === 'confident').length
  const needsPractice = progress.filter((p) => p.status === 'needs_practice').length
  const unseen = TOTAL_QUESTIONS - confident - needsPractice
  const weakCount = QUESTIONS.filter((q) => byId.get(q.id)?.status === 'needs_practice').length
  const firstName = user?.firstName ?? user?.username ?? 'there'
  const categories = CATEGORIES.map((c) => ({
    name: c,
    total: QUESTIONS.filter((q) => q.category === c).length,
  }))

  return (
    <DashboardUI
      firstName={firstName}
      studied={studied}
      confident={confident}
      needsPractice={needsPractice}
      unseen={unseen}
      weakCount={weakCount}
      paid={paid}
      paidParam={paidParam === '1'}
      recentTests={recentTests}
      totalQuestions={TOTAL_QUESTIONS}
      starredCount={STARRED_QUESTIONS.length}
      categories={categories}
    />
  )
}
