import { format, endOfMonth } from 'date-fns'
import { createClient } from '@/lib/supabase/server'

export async function applyRecurringExpenses(userId: string): Promise<void> {
  const supabase = await createClient()
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()
  const todayDay = today.getDate()

  const { data: recurring } = await supabase
    .from('recurring_expenses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (!recurring?.length) return

  const toApply = recurring.filter(rec => rec.day_of_month <= todayDay)
  if (!toApply.length) return

  // Find which recurring expenses already have an entry this month
  const { data: existing } = await supabase
    .from('expenses')
    .select('recurring_id')
    .in('recurring_id', toApply.map(r => r.id))
    .gte('expense_date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
    .lte('expense_date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(new Date(currentYear, currentMonth, 0).getDate()).padStart(2, '0')}`)

  const alreadyInserted = new Set((existing ?? []).map(e => e.recurring_id))

  const inserts = toApply
    .filter(rec => !alreadyInserted.has(rec.id))
    .map(rec => ({
      user_id: userId,
      category_id: rec.category_id,
      recurring_id: rec.id,
      amount: rec.amount,
      description: rec.name,
      expense_date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(rec.day_of_month).padStart(2, '0')}`,
      is_favorite: false,
    }))

  if (inserts.length) {
    await supabase.from('expenses').insert(inserts)
  }
}

export async function checkAndFinalizeMonths(userId: string, currentBudget: number): Promise<void> {
  const supabase = await createClient()
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()

  const { data: lastSaving } = await supabase
    .from('monthly_savings')
    .select('year, month')
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(1)
    .maybeSingle()

  let startYear = currentYear
  let startMonth = currentMonth - 1
  if (startMonth === 0) { startMonth = 12; startYear-- }

  if (lastSaving) {
    startYear = lastSaving.year
    startMonth = lastSaving.month
    // Advance by one month past the last saved
    startMonth++
    if (startMonth > 12) { startMonth = 1; startYear++ }
  } else {
    // No savings yet — nothing to finalize
    return
  }

  // Finalize all months from startMonth up to (but not including) current month
  let y = startYear
  let m = startMonth
  while (y < currentYear || (y === currentYear && m < currentMonth)) {
    const monthStart = `${y}-${String(m).padStart(2, '0')}-01`
    const monthEnd = format(endOfMonth(new Date(y, m - 1)), 'yyyy-MM-dd')

    const { data: expensesData } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId)
      .gte('expense_date', monthStart)
      .lte('expense_date', monthEnd)

    const totalSpent = (expensesData ?? []).reduce((sum, e) => sum + e.amount, 0)

    await supabase.from('monthly_savings').upsert({
      user_id: userId,
      year: y,
      month: m,
      budget_amount: currentBudget,
      total_spent: totalSpent,
      net_savings: currentBudget - totalSpent,
    }, { onConflict: 'user_id,year,month' })

    m++
    if (m > 12) { m = 1; y++ }
  }
}
