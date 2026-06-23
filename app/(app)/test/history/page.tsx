import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAllTests } from '@/lib/server-tests'
import { HistoryUI } from './history-ui'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Test history · Civics Study' }

export default async function TestHistoryPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const runs = await getAllTests()

  return <HistoryUI runs={runs} />
}
