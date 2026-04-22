'use server'

import { createClient } from '@/lib/supabase/server'
import { applyRecurringExpenses } from '@/lib/recurring'

export async function createRecurringExpense(data: {
  name: string
  amount: number
  category_id?: string | null
  day_of_month: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  const { error } = await supabase.from('recurring_expenses').insert({
    user_id: user.id,
    name: data.name,
    amount: data.amount,
    category_id: data.category_id ?? null,
    day_of_month: data.day_of_month,
    is_active: true,
  })

  if (error) throw new Error(error.message)

  await applyRecurringExpenses(user.id)
}

export async function updateRecurringExpense(
  id: string,
  data: {
    name?: string
    amount?: number
    category_id?: string | null
    day_of_month?: number
    is_active?: boolean
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  const { error } = await supabase
    .from('recurring_expenses')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  const expenseUpdates: {
    description?: string
    amount?: number
    category_id?: string | null
  } = {}
  if (data.name !== undefined) expenseUpdates.description = data.name
  if (data.amount !== undefined) expenseUpdates.amount = data.amount
  if (data.category_id !== undefined) expenseUpdates.category_id = data.category_id

  if (Object.keys(expenseUpdates).length > 0) {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth() + 1
    const pad = (n: number) => String(n).padStart(2, '0')
    await supabase
      .from('expenses')
      .update(expenseUpdates)
      .eq('recurring_id', id)
      .eq('user_id', user.id)
      .gte('expense_date', `${y}-${pad(m)}-01`)
      .lte('expense_date', `${y}-${pad(m)}-${pad(new Date(y, m, 0).getDate())}`)
  }

  if (data.is_active !== false) {
    await applyRecurringExpenses(user.id)
  }
}

export async function deleteRecurringExpense(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  const { error } = await supabase
    .from('recurring_expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
}
