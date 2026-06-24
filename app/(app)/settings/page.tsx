import { auth, currentUser } from '@clerk/nextjs/server'
import { getUserSettings } from '@/lib/server-settings'
import { getInterviewDate } from '@/lib/server-interview'
import { SettingsUI } from './settings-ui'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Settings · Civics Study' }

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) return null

  const [settings, interviewDate, user] = await Promise.all([
    getUserSettings(userId),
    getInterviewDate(userId),
    currentUser(),
  ])

  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? ''

  return (
    <SettingsUI
      zip={settings.zip}
      dailyGoal={settings.dailyGoal}
      fontSize={settings.fontSize}
      interviewDate={interviewDate}
      userEmail={userEmail}
    />
  )
}
