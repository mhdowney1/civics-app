import { QUESTIONS, shuffle } from '@/lib/questions'
import { MockTest } from './mock-test'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mock test · US Civics Study' }

export default function TestPage() {
  const sample = shuffle(QUESTIONS).slice(0, 20)
  return <MockTest questions={sample} />
}
