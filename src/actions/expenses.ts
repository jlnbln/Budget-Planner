'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { localDateString } from '@/lib/utils'

export async function removeFavorite(description: string, categoryId: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  const query = supabase
    .from('expenses')
    .update({ is_favorite: false })
    .eq('user_id', user.id)
    .eq('description', description)
    .eq('is_favorite', true)

  if (categoryId) {
    await query.eq('category_id', categoryId)
  } else {
    await query.is('category_id', null)
  }

  revalidatePath('/einstellungen')
  revalidatePath('/dashboard')
}

export async function updateFavoriteTemplate(
  description: string,
  categoryId: string | null,
  newData: { amount: number; description: string; category_id: string | null }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  // Find the most recent favorite with this description+category and update it
  const baseQuery = supabase
    .from('expenses')
    .select('id')
    .eq('user_id', user.id)
    .eq('description', description)
    .eq('is_favorite', true)
    .order('expense_date', { ascending: false })
    .limit(1)

  const { data: match } = await (categoryId
    ? baseQuery.eq('category_id', categoryId)
    : baseQuery.is('category_id', null)
  ).maybeSingle()

  if (!match) return

  await supabase
    .from('expenses')
    .update({
      amount: newData.amount,
      description: newData.description,
      category_id: newData.category_id,
    })
    .eq('id', match.id)

  revalidatePath('/einstellungen')
  revalidatePath('/dashboard')
}

export async function createExpense(data: {
  amount: number
  description: string
  category_id?: string | null
  is_favorite?: boolean
  expense_date?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    amount: data.amount,
    description: data.description,
    category_id: data.category_id ?? null,
    expense_date: data.expense_date ?? localDateString(),
    is_favorite: data.is_favorite ?? false,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/ausgaben')
  revalidatePath('/analyse')
}

export async function updateExpense(
  id: string,
  data: {
    amount?: number
    description?: string
    category_id?: string | null
    expense_date?: string
    is_favorite?: boolean
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  const { error } = await supabase
    .from('expenses')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/ausgaben')
  revalidatePath('/analyse')
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/ausgaben')
  revalidatePath('/analyse')
}
