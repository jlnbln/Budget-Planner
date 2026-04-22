'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { applyRecurringExpenses, checkAndFinalizeMonths } from '@/lib/recurring'
import { localDateString } from '@/lib/utils'

/** Returns true if the check ran (i.e. it wasn't already done today). */
export async function runDailyCheck(userId: string): Promise<boolean> {
  const cookieStore = await cookies()
  const today = localDateString()
  const cookieKey = `recurring_checked_${userId}`

  if (cookieStore.get(cookieKey)?.value === today) return false

  cookieStore.set(cookieKey, today, {
    httpOnly: true,
    sameSite: 'lax',
    expires: new Date(new Date().toDateString() + ' 23:59:59'),
  })

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('monthly_budget')
    .eq('id', userId)
    .single()
  const budget = profile?.monthly_budget ?? 1000

  await Promise.all([
    applyRecurringExpenses(userId),
    checkAndFinalizeMonths(userId, budget),
  ])

  return true
}
