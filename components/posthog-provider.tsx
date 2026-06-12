'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { useUser } from '@clerk/nextjs'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PostHogIdentify />
      {children}
    </>
  )
}

function PostHogIdentify() {
  const { user, isSignedIn } = useUser()

  useEffect(() => {
    if (!posthog.__loaded) return
    if (isSignedIn && user) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
      })
    } else if (!isSignedIn) {
      posthog.reset()
    }
  }, [isSignedIn, user])

  return null
}
