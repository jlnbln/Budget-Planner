'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateBudget(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Ungültiger Betrag')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  const { error } = await supabase
    .from('profiles')
    .update({ monthly_budget: amount, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
}
