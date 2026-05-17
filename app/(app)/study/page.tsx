import { redirect } from 'next/navigation'
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
  const params = await searchParams
  const mode = params.mode
  const category = params.category

  let pool: Question[] = []
  let label = 'All 128 questions'

  if (mode === 'starred') {
    pool = STARRED_QUESTIONS
    label = 'Starred (65/20)'
  } else if (mode === 'weak') {
    const progress = await getServerProgress()
    const weakIds = new Set(
      progress
        .filter((p) => p.status === 'needs_practice')
        .map((p) => p.questionId),
    )
    pool = QUESTIONS.filter((q) => weakIds.has(q.id))
    label = 'Needs practice'
    if (pool.length === 0) {
      redirect('/dashboard')
    }
  } else if (category) {
    const cat = CATEGORIES.find((c) => c === category) as
      | CategoryName
      | undefined
    if (!cat) redirect('/dashboard')
    pool = getByCategory(cat!)
    label = cat!
  } else {
    pool = QUESTIONS
  }

  const session = shuffle(pool)

  return (
    <StudySession
      initialQuestions={session}
      modeLabel={label}
      mode={mode ?? (category ? 'category' : 'all')}
    />
  )
}
