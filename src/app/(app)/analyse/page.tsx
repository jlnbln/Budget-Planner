'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useProfile, useExpenses, useMonthlySavings, useMonthlyTotals } from '@/hooks/use-data'
import SavingsSummary from '@/components/analyse/SavingsSummary'
import StatsGrid from '@/components/analyse/StatsGrid'
import { computeMonthlyStats } from '@/lib/calculations'
import { formatMonthShort } from '@/lib/utils'
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'
import type { ExpenseWithCategory } from '@/types/database'

const CategoryPieChart = dynamic(() => import('@/components/analyse/CategoryPieChart'), { ssr: false })
const MonthlyTrendChart = dynamic(() => import('@/components/analyse/MonthlyTrendChart'), { ssr: false })
const BudgetUtilizationChart = dynamic(() => import('@/components/analyse/BudgetUtilizationChart'), { ssr: false })

export default function AnalysePage() {
  const now = useMemo(() => new Date(), [])
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  // Date range covering the 5 past months + current month
  const from = useMemo(() => format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd'), [now])
  const to = useMemo(() => format(endOfMonth(now), 'yyyy-MM-dd'), [now])

  const { data: profile } = useProfile()
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(month, year)
  const { data: pastSavings = [], isLoading: savingsLoading } = useMonthlySavings()
  const { data: monthlyTotals = [], isLoading: totalsLoading } = useMonthlyTotals(from, to)

  const isLoading = expensesLoading || savingsLoading || totalsLoading

  const budget = profile?.monthly_budget ?? 1000
  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])

  const stats = useMemo(
    () => computeMonthlyStats(expenses as ExpenseWithCategory[], budget, month, year),
    [expenses, budget, month, year],
  )

  // trendData: past 5 months from direct expense query, current month from live expenses
  const trendData = useMemo(() => {
    const result = []
    for (let i = 5; i >= 1; i--) {
      const d = subMonths(now, i)
      const m = d.getMonth() + 1
      const y = d.getFullYear()
      const monthTotal = monthlyTotals.find(t => t.month === m && t.year === y)
      // Use finalized budget amount if available, otherwise fall back to current budget
      const saving = pastSavings.find(s => s.month === m && s.year === y)
      result.push({
        label: formatMonthShort(m, y),
        spent: monthTotal?.total_spent ?? 0,
        budget: saving?.budget_amount ?? budget,
      })
    }
    result.push({ label: formatMonthShort(month, year), spent: totalSpent, budget })
    return result
  }, [monthlyTotals, pastSavings, now, month, year, totalSpent, budget])

  // totalSavings: only count months where the user actually had data (was using the app).
  // Historical months outside the 6-month window: from monthly_savings (already filtered by having a row).
  // Recent past months: only count if they appear in monthlyTotals or pastSavings.
  // Current month: always counted since the user is actively using the app.
  const totalSavings = useMemo(() => {
    const windowStartDate = subMonths(now, 5)
    const windowStartYear = windowStartDate.getFullYear()
    const windowStartMonth = windowStartDate.getMonth() + 1

    const historical = pastSavings
      .filter(s => s.year < windowStartYear || (s.year === windowStartYear && s.month < windowStartMonth))
      .reduce((sum, s) => sum + s.net_savings, 0)

    let recent = 0
    for (let i = 5; i >= 1; i--) {
      const d = subMonths(now, i)
      const m = d.getMonth() + 1
      const y = d.getFullYear()
      const monthTotal = monthlyTotals.find(t => t.month === m && t.year === y)
      const saving = pastSavings.find(s => s.month === m && s.year === y)
      // Skip months with no data — user wasn't using the app yet
      if (!monthTotal && !saving) continue
      const monthBudget = saving?.budget_amount ?? budget
      recent += monthBudget - (monthTotal?.total_spent ?? 0)
    }

    return historical + recent + (budget - totalSpent)
  }, [pastSavings, monthlyTotals, budget, totalSpent, now])

  const utilizationData = useMemo(
    () => trendData.map(d => ({
      label: d.label,
      percent: d.budget > 0 ? (d.spent / d.budget) * 100 : 0,
    })),
    [trendData],
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
          <SavingsSummary totalSavings={totalSavings} currentMonthNet={budget - totalSpent} />

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
