'use client'

import { useEffect } from 'react'
import { flushQueue } from '@/lib/progress-client'

export function OfflineSync() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    void flushQueue()

    const onOnline = () => {
      void flushQueue()
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])

  return null
}
