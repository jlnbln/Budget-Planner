'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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
  revalidatePath('/einstellungen')
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
  revalidatePath('/einstellungen')
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
  revalidatePath('/einstellungen')
}
