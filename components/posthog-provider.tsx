'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { useUser } from '@clerk/nextjs'

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!POSTHOG_KEY) return
    if (typeof window === 'undefined') return
    if (posthog.__loaded) return
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: 'history_change',
      capture_pageleave: true,
      person_profiles: 'identified_only',
    })
  }, [])

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
    if (!POSTHOG_KEY) return
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
