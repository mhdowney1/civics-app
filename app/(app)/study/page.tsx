import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import {
  QUESTIONS,
  STARRED_QUESTIONS,
  getByCategory,
  shuffle,
} from '@/lib/questions'
import { CATEGORIES, type CategoryName, type Question } from '@/lib/types'
import { getServerProgress } from '@/lib/server-progress'
import { StudySession } from './study-session'

type SearchParams = Promise<{
  mode?: string
  category?: string
}>

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Study · US Civics Study' }

export default async function StudyPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [{ userId }, params] = await Promise.all([auth(), searchParams])
  const isSignedIn = Boolean(userId)
  const mode = params.mode
  const category = params.category

  let pool: Question[] = []
  let resolvedCategory: CategoryName | undefined

  if (mode === 'starred') {
    pool = STARRED_QUESTIONS
  } else if (mode === 'weak') {
    const progress = await getServerProgress()
    const weakIds = new Set(
      progress
        .filter((p) => p.status === 'needs_practice')
        .map((p) => p.questionId),
    )
    pool = QUESTIONS.filter((q) => weakIds.has(q.id))
    if (pool.length === 0) {
      redirect('/dashboard')
    }
  } else if (category) {
    const cat = CATEGORIES.find((c) => c === category) as
      | CategoryName
      | undefined
    if (!cat) redirect('/dashboard')
    resolvedCategory = cat!
    pool = getByCategory(cat!)
  } else {
    pool = QUESTIONS
  }

  const session = shuffle(pool)

  return (
    <StudySession
      initialQuestions={session}
      mode={mode ?? (category ? 'category' : 'all')}
      category={resolvedCategory}
      isSignedIn={isSignedIn}
    />
  )
}
