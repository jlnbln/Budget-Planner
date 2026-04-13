import { cache } from 'react'
import { createClient } from './server'

/**
 * React cache()-wrapped helpers — deduplicate identical Supabase calls that
 * occur in both the layout and the page during the same server render pass.
 * The memoisation is scoped per request; there is no cross-request caching.
 */

export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('monthly_budget, email')
    .eq('id', userId)
    .single()
  return data
})
