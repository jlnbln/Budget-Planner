'use server'

import { cookies } from 'next/headers'
import { applyRecurringExpenses, checkAndFinalizeMonths } from '@/lib/recurring'

export async function runDailyCheck(userId: string, budget: number): Promise<void> {
  const cookieStore = await cookies()
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const cookieKey = `recurring_checked_${userId}`

  if (cookieStore.get(cookieKey)?.value === today) return

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
}
