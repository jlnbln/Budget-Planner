'use client'

import { useEffect } from 'react'
import { runDailyCheck } from '@/actions/daily-check'

interface Props {
  userId: string
  budget: number
}

export default function DailyRecurringCheck({ userId, budget }: Props) {
  useEffect(() => {
    runDailyCheck(userId, budget).catch(() => {})
  }, [userId, budget])

  return null
}
