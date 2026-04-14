'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { runDailyCheck } from '@/actions/daily-check'

interface Props {
  userId: string
  budget: number
}

export default function DailyRecurringCheck({ userId, budget }: Props) {
  const router = useRouter()

  useEffect(() => {
    runDailyCheck(userId, budget)
      .then((applied) => {
        // If recurring expenses were newly applied, refresh so they appear immediately
        if (applied) router.refresh()
      })
      .catch(() => {})
  }, [userId, budget, router])

  return null
}
