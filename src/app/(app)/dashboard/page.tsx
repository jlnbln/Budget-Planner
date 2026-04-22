'use client'

import { useMemo } from 'react'
import { useProfile, useExpenses, useCategories, useFavorites } from '@/hooks/use-data'
import BudgetGauge from '@/components/dashboard/BudgetGauge'
import FavoriteTiles from '@/components/dashboard/FavoriteTiles'
import RecentExpensesList from '@/components/dashboard/RecentExpensesList'
import AddExpenseModal from '@/components/dashboard/AddExpenseModal'
import type { ExpenseWithCategory } from '@/types/database'

export default function DashboardPage() {
  const now = useMemo(() => new Date(), [])
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const { data: profile } = useProfile()
  const { data: expenses = [], isLoading } = useExpenses(month, year)
  const { data: categories = [] } = useCategories()
  const { data: allFavorites = [] } = useFavorites()

  const budget = profile?.monthly_budget ?? 1000
  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])
  const recentExpenses = useMemo(() => expenses.slice(0, 5), [expenses])

  const uniqueFavorites = useMemo(() => {
    const seen = new Set<string>()
    const result: ExpenseWithCategory[] = []
    for (const fav of allFavorites) {
      const key = `${fav.description}::${fav.category?.id ?? 'none'}`
      if (!seen.has(key)) { seen.add(key); result.push(fav) }
      if (result.length >= 8) break
    }
    return result
  }, [allFavorites])

  const greeting = now.getHours() < 12
    ? 'Guten Morgen'
    : now.getHours() < 18
    ? 'Guten Tag'
    : 'Guten Abend'

  return (
    <div className="px-5 pt-4 pb-4 space-y-6 max-w-2xl mx-auto">
      <section className="space-y-0.5">
        <h1 className="font-headline text-[1.75rem] font-bold text-[#001939]">Budget Übersicht</h1>
        <p className="text-[#43474f] text-sm">{greeting} — heute ist ein guter Tag zum Sparen.</p>
      </section>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-32 bg-white rounded-2xl animate-pulse" />
          <div className="h-20 bg-white rounded-2xl animate-pulse" />
          <div className="h-48 bg-white rounded-2xl animate-pulse" />
        </div>
      ) : (
        <>
          <BudgetGauge spent={totalSpent} budget={budget} />
          {uniqueFavorites.length > 0 && <FavoriteTiles favorites={uniqueFavorites} />}
          <section className="space-y-3">
            <h2 className="font-headline font-semibold text-[#001939] text-base">Letzte Aktivitäten</h2>
            <RecentExpensesList expenses={recentExpenses} />
          </section>
        </>
      )}

      <AddExpenseModal categories={categories} />
    </div>
  )
}
