'use client'

import { useMemo } from 'react'
import { useProfile, useExpenses, useCategories, useMonthlySavings } from '@/hooks/use-data'
import SavingsSummary from '@/components/analyse/SavingsSummary'
import CategoryPieChart from '@/components/analyse/CategoryPieChart'
import MonthlyTrendChart from '@/components/analyse/MonthlyTrendChart'
import StatsGrid from '@/components/analyse/StatsGrid'
import BudgetUtilizationChart from '@/components/analyse/BudgetUtilizationChart'
import { computeMonthlyStats, computeAccumulatedSavings } from '@/lib/calculations'
import { formatMonthShort } from '@/lib/utils'
import { subMonths } from 'date-fns'
import type { ExpenseWithCategory } from '@/types/database'

export default function AnalysePage() {
  const now = useMemo(() => new Date(), [])
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const { data: profile } = useProfile()
  const { data: expenses = [], isLoading } = useExpenses(month, year)
  const { data: categories = [] } = useCategories()
  const { data: pastSavings = [] } = useMonthlySavings()

  const budget = profile?.monthly_budget ?? 1000
  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])
  const currentMonthNet = budget - totalSpent

  const stats = useMemo(
    () => computeMonthlyStats(expenses as ExpenseWithCategory[], budget, month, year),
    [expenses, budget, month, year],
  )

  const totalSavings = useMemo(
    () => computeAccumulatedSavings(pastSavings, totalSpent, budget),
    [pastSavings, totalSpent, budget],
  )

  const categoryData = useMemo(() => {
    const map = new Map<string, { name: string; emoji: string; color: string; amount: number }>()
    for (const expense of expenses as ExpenseWithCategory[]) {
      const catId = expense.category?.id ?? '__none__'
      const existing = map.get(catId)
      if (existing) {
        existing.amount += expense.amount
      } else {
        map.set(catId, {
          name: expense.category?.name ?? 'Ohne Kategorie',
          emoji: expense.category?.emoji ?? '📦',
          color: expense.category?.color ?? '#94a3b8',
          amount: expense.amount,
        })
      }
    }
    return Array.from(map.values())
  }, [expenses])

  const trendData = useMemo(() => {
    const result = []
    for (let i = 5; i >= 1; i--) {
      const d = subMonths(now, i)
      const m = d.getMonth() + 1
      const y = d.getFullYear()
      const saving = pastSavings.find(s => s.month === m && s.year === y)
      result.push({
        label: formatMonthShort(m, y),
        spent: saving?.total_spent ?? 0,
        budget: saving?.budget_amount ?? budget,
      })
    }
    result.push({ label: formatMonthShort(month, year), spent: totalSpent, budget })
    return result
  }, [pastSavings, now, month, year, totalSpent, budget])

  const utilizationData = useMemo(
    () => trendData.map(d => ({
      label: d.label,
      percent: d.budget > 0 ? (d.spent / d.budget) * 100 : 0,
    })),
    [trendData],
  )

  // Use monthly_savings for YoY — avoids an extra query
  const lySaving = pastSavings.find(s => s.month === month && s.year === year - 1)
  const lyTotal = lySaving?.total_spent ?? 0
  const yoyPercent = lyTotal > 0 ? ((totalSpent - lyTotal) / lyTotal) * 100 : null

  return (
    <div className="px-5 pt-4 pb-4 max-w-2xl mx-auto space-y-6">
      <section className="bg-[#f3f4f5] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#002d5e]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative space-y-1">
          <span className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">Finanzielle Übersicht</span>
          <h1 className="font-headline text-[1.75rem] font-bold text-[#001939] tracking-tight">Analyse</h1>
        </div>
      </section>

      {isLoading ? (
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <SavingsSummary totalSavings={totalSavings} currentMonthNet={currentMonthNet} />

          <div className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_-2px_rgba(25,28,29,0.05)]">
            <h2 className="font-headline font-semibold text-[#001939] mb-4">Ausgaben nach Kategorie</h2>
            <CategoryPieChart data={categoryData} />
          </div>

          <div>
            <h2 className="font-headline font-semibold text-[#001939] mb-3">Statistiken diesen Monat</h2>
            <StatsGrid stats={stats} yoyPercent={yoyPercent} />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_-2px_rgba(25,28,29,0.05)]">
            <h2 className="font-headline font-semibold text-[#001939] mb-4">Ausgaben der letzten 6 Monate</h2>
            <MonthlyTrendChart data={trendData} />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_-2px_rgba(25,28,29,0.05)]">
            <h2 className="font-headline font-semibold text-[#001939] mb-4">Budget-Auslastung im Verlauf</h2>
            <BudgetUtilizationChart data={utilizationData} />
          </div>
        </>
      )}
    </div>
  )
}
