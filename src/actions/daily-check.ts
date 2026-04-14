'use server'

import { cookies } from 'next/headers'
import { applyRecurringExpenses, checkAndFinalizeMonths } from '@/lib/recurring'
import { localDateString } from '@/lib/utils'

/** Returns true if the check ran (i.e. it wasn't already done today). */
export async function runDailyCheck(userId: string, budget: number): Promise<boolean> {
  const cookieStore = await cookies()
  const today = localDateString() // YYYY-MM-DD in local timezone
  const cookieKey = `recurring_checked_${userId}`

  if (cookieStore.get(cookieKey)?.value === today) return false

  // Scoped to this user — cookie expires at end of day so it re-runs tomorrow.
  cookieStore.set(cookieKey, today, {
    httpOnly: true,
    sameSite: 'lax',
    expires: new Date(new Date().toDateString() + ' 23:59:59'),
  })

  await Promise.all([
    applyRecurringExpenses(userId),
    checkAndFinalizeMonths(userId, budget),
  ])

  return true
}
