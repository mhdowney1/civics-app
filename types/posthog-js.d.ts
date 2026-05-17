declare module 'posthog-js' {
  export interface PostHogConfig {
    api_host?: string
    capture_pageview?: boolean | 'history_change'
    capture_pageleave?: boolean
    person_profiles?: 'always' | 'identified_only' | 'never'
    [key: string]: unknown
  }

  export interface PostHog {
    __loaded: boolean
    init(key: string, config?: PostHogConfig): void
    capture(event: string, properties?: Record<string, unknown>): void
    identify(distinctId: string, properties?: Record<string, unknown>): void
    reset(): void
    register(properties: Record<string, unknown>): void
    opt_in_capturing(): void
    opt_out_capturing(): void
  }

  const posthog: PostHog
  export default posthog
}
