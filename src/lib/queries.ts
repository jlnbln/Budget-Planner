import { createClient } from './supabase/client'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import type { Category, ExpenseWithCategory, MonthlySavings, RecurringExpense } from '@/types/database'

export async function fetchUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function fetchProfile(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('monthly_budget, email')
    .eq('id', userId)
    .single()
  return data
}

export async function fetchExpenses(userId: string, month: number, year: number) {
  const supabase = createClient()
  const start = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd')
  const end = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd')
  const { data } = await supabase
    .from('expenses')
    .select('*, category:categories(*)')
    .eq('user_id', userId)
    .gte('expense_date', start)
    .lte('expense_date', end)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })
  return (data ?? []) as ExpenseWithCategory[]
}

export async function fetchCategories(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order')
  return (data ?? []) as Category[]
}

export async function fetchFavorites(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('expenses')
    .select('*, category:categories(*)')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('expense_date', { ascending: false })
    .limit(100)
  return (data ?? []) as ExpenseWithCategory[]
}

export async function fetchRecurringExpenses(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('recurring_expenses')
    .select('*, category:categories(*)')
    .eq('user_id', userId)
    .order('day_of_month')
  return (data ?? []) as RecurringExpense[]
}

export async function fetchMonthlySavings(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('monthly_savings')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: true })
    .order('month', { ascending: true })
  return (data ?? []) as MonthlySavings[]
}
