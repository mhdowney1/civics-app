import { QUESTIONS } from '@/lib/questions'
import { getServerProgress } from '@/lib/server-progress'
import { ProgressView } from './progress-view'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Progress · US Civics Study' }

export default async function ProgressPage() {
  const progress = await getServerProgress()
  return <ProgressView questions={QUESTIONS} initialProgress={progress} />
}
