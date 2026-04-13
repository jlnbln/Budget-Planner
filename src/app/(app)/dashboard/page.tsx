import { createClient } from '@/lib/supabase/server'
import BudgetGauge from '@/components/dashboard/BudgetGauge'
import FavoriteTiles from '@/components/dashboard/FavoriteTiles'
import RecentExpensesList from '@/components/dashboard/RecentExpensesList'
import AddExpenseModal from '@/components/dashboard/AddExpenseModal'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import type { ExpenseWithCategory } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

  const [profileResult, expensesResult, categoriesResult, favoritesResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('monthly_budget, email')
      .eq('id', user!.id)
      .single(),
    supabase
      .from('expenses')
      .select('*, category:categories(*)')
      .eq('user_id', user!.id)
      .gte('expense_date', monthStart)
      .lte('expense_date', monthEnd)
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user!.id)
      .order('sort_order'),
    supabase
      .from('expenses')
      .select('*, category:categories(*)')
      .eq('user_id', user!.id)
      .eq('is_favorite', true)
      .order('expense_date', { ascending: false })
      .limit(50),
  ])

  const profile = profileResult.data
  const allExpenses = (expensesResult.data ?? []) as ExpenseWithCategory[]
  const categories = categoriesResult.data ?? []

  const budget = profile?.monthly_budget ?? 1000
  const totalSpent = allExpenses.reduce((sum, e) => sum + e.amount, 0)
  const recentExpenses = allExpenses.slice(0, 5)

  const allFavoritesData = favoritesResult.data

  const allFavorites = ((allFavoritesData ?? []) as ExpenseWithCategory[])
  const uniqueFavorites: ExpenseWithCategory[] = []
  const seen = new Set<string>()
  for (const fav of allFavorites) {
    const key = `${fav.description}::${fav.category?.id ?? 'none'}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueFavorites.push(fav)
    }
    if (uniqueFavorites.length >= 8) break
  }

  const greeting = now.getHours() < 12
    ? 'Guten Morgen'
    : now.getHours() < 18
    ? 'Guten Tag'
    : 'Guten Abend'

  return (
    <div className="px-5 pt-4 pb-4 space-y-6 max-w-2xl mx-auto">
      {/* Page heading */}
      <section className="space-y-0.5">
        <h1 className="font-headline text-[1.75rem] font-bold text-[#001939]">Budget Übersicht</h1>
        <p className="text-[#43474f] text-sm">{greeting} — heute ist ein guter Tag zum Sparen.</p>
      </section>

      {/* Budget card */}
      <BudgetGauge spent={totalSpent} budget={budget} />

      {/* Favorites */}
      {uniqueFavorites.length > 0 && (
        <FavoriteTiles favorites={uniqueFavorites} />
      )}

      {/* Recent expenses */}
      <section className="space-y-3">
        <h2 className="font-headline font-semibold text-[#001939] text-base">Letzte Aktivitäten</h2>
        <RecentExpensesList expenses={recentExpenses} />
      </section>

      {/* Add Expense FAB */}
      <AddExpenseModal categories={categories} />
    </div>
  )
}
