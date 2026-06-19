'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fireConfetti } from '@/lib/confetti'

const MILESTONES = [32, 64, 96, 128]
const MILESTONE_KEY = 'civics:celebrated-milestones'

function getCelebrated(): number[] {
  try {
    return JSON.parse(localStorage.getItem(MILESTONE_KEY) ?? '[]') as number[]
  } catch {
    return []
  }
}

export function DashboardConfetti({
  confident,
  paid,
}: {
  confident: number
  paid: boolean
}) {
  const router = useRouter()

  useEffect(() => {
    if (paid) {
      fireConfetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } })
      const url = new URL(window.location.href)
      url.searchParams.delete('paid')
      router.replace(url.pathname + url.search)
    }

    const celebrated = getCelebrated()
    const newMilestone = [...MILESTONES]
      .reverse()
      .find((m) => confident >= m && !celebrated.includes(m))

    if (newMilestone) {
      localStorage.setItem(
        MILESTONE_KEY,
        JSON.stringify([...celebrated, newMilestone]),
      )
      fireConfetti({
        particleCount: newMilestone === 128 ? 200 : 80,
        spread: newMilestone === 128 ? 120 : 70,
        origin: { y: 0.6 },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
