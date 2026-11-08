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
    } else if (isSignedIn === false && posthog.get_property('$user_state') === 'identified') {
      // Only reset after a real sign-out. isSignedIn is undefined while Clerk
      // loads; resetting then gave anonymous visitors a new distinct ID on
      // every page load, which breaks funnels and price-test assignment.
      posthog.reset()
    }
  }, [isSignedIn, user])

  return null
}
