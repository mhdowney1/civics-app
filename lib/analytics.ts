import posthog from 'posthog-js'

type EventName =
  | 'study_session_started'
  | 'question_answered'
  | 'mock_test_completed'

type EventProperties = Record<string, unknown>

export function track(event: EventName, properties?: EventProperties) {
  if (typeof window === 'undefined') return
  if (!posthog.__loaded) return
  posthog.capture(event, properties)
}
