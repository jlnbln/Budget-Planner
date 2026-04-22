'use client'

import { useEffect } from 'react'
import { useInvalidate } from '@/hooks/use-data'
import { runDailyCheck } from '@/actions/daily-check'

interface Props {
  userId: string
}

export default function DailyRecurringCheck({ userId }: Props) {
  const invalidate = useInvalidate()

  useEffect(() => {
    runDailyCheck(userId)
      .then((applied) => {
        if (applied) {
          invalidate.expenses()
          invalidate.savings()
        }
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return null
}
