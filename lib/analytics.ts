import posthog from 'posthog-js'

type EventName =
  | 'study_session_started'
  | 'study_session_completed'
  | 'question_answered'
  | 'mock_test_started'
  | 'mock_test_completed'
  | 'progress_reset'
  | 'checkout_initiated'
  | 'user_feedback_submitted'

type EventProperties = Record<string, unknown>

export function track(event: EventName, properties?: EventProperties) {
  if (typeof window === 'undefined') return
  if (!posthog.__loaded) return
  posthog.capture(event, properties)
}
