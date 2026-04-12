import { createClient } from '@/lib/supabase/server'
import SavingsSummary from '@/components/analyse/SavingsSummary'
import CategoryPieChart from '@/components/analyse/CategoryPieChart'
import MonthlyTrendChart from '@/components/analyse/MonthlyTrendChart'
import StatsGrid from '@/components/analyse/StatsGrid'
import BudgetUtilizationChart from '@/components/analyse/BudgetUtilizationChart'
import { computeMonthlyStats, computeAccumulatedSavings } from '@/lib/calculations'
import { formatMonthShort } from '@/lib/utils'
import type { ExpenseWithCategory, MonthlySavings } from '@/types/database'
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'

export default async function AnalysePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

  const lastYear = year - 1
  const lyMonthStart = format(startOfMonth(new Date(lastYear, month - 1)), 'yyyy-MM-dd')
  const lyMonthEnd = format(endOfMonth(new Date(lastYear, month - 1)), 'yyyy-MM-dd')

  const sixMonthsAgo = subMonths(now, 5)
  const sixMonthsAgoStart = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}-01`

  const [
    profileResult,
    currentExpensesResult,
    savingsResult,
    trendExpensesResult,
    lastYearExpensesResult,
    categoriesResult,
  ] = await Promise.all([
    supabase.from('profiles').select('monthly_budget').eq('id', user!.id).single(),
    supabase
      .from('expenses')
      .select('*, category:categories(*)')
      .eq('user_id', user!.id)
      .gte('expense_date', monthStart)
      .lte('expense_date', monthEnd),
    supabase
      .from('monthly_savings')
      .select('*')
      .eq('user_id', user!.id)
      .order('year', { ascending: true })
      .order('month', { ascending: true }),
    supabase
      .from('expenses')
      .select('amount, expense_date')
      .eq('user_id', user!.id)
      .gte('expense_date', sixMonthsAgoStart)
      .lt('expense_date', monthStart),
    supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user!.id)
      .gte('expense_date', lyMonthStart)
      .lte('expense_date', lyMonthEnd),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user!.id)
      .order('sort_order'),
  ])

  const budget = profileResult.data?.monthly_budget ?? 1000
  const currentExpenses = (currentExpensesResult.data ?? []) as ExpenseWithCategory[]
  const pastSavings = (savingsResult.data ?? []) as MonthlySavings[]
  const categories = categoriesResult.data ?? []

  const totalSpent = currentExpenses.reduce((sum, e) => sum + e.amount, 0)
  const currentMonthNet = budget - totalSpent
  const stats = computeMonthlyStats(currentExpenses, budget, month, year)

  const totalSavings = computeAccumulatedSavings(pastSavings, totalSpent, budget)

  const categoryMap = new Map<string, { name: string; emoji: string; color: string; amount: number }>()
  for (const expense of currentExpenses) {
    const catId = expense.category?.id ?? '__none__'
    const existing = categoryMap.get(catId)
    if (existing) {
      existing.amount += expense.amount
    } else {
      categoryMap.set(catId, {
        name: expense.category?.name ?? 'Ohne Kategorie',
        emoji: expense.category?.emoji ?? '📦',
        color: expense.category?.color ?? '#94a3b8',
        amount: expense.amount,
      })
    }
  }
  const categoryData = Array.from(categoryMap.values())

  const trendData: { label: string; spent: number; budget: number }[] = []
  for (let i = 5; i >= 1; i--) {
    const d = subMonths(now, i)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    const savings = pastSavings.find(s => s.month === m && s.year === y)
    trendData.push({
      label: formatMonthShort(m, y),
      spent: savings?.total_spent ?? 0,
      budget: savings?.budget_amount ?? budget,
    })
  }
  trendData.push({
    label: formatMonthShort(month, year),
    spent: totalSpent,
    budget,
  })

  const utilizationData = trendData.map(d => ({
    label: d.label,
    percent: d.budget > 0 ? (d.spent / d.budget) * 100 : 0,
  }))

  const lyTotal = (lastYearExpensesResult.data ?? []).reduce((sum, e) => sum + e.amount, 0)
  const yoyPercent = lyTotal > 0
    ? ((totalSpent - lyTotal) / lyTotal) * 100
    : null

  return (
    <div className="px-5 pt-4 pb-4 max-w-2xl mx-auto space-y-6">
      {/* Hero */}
      <section className="bg-[#f3f4f5] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#002d5e]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative space-y-1">
          <span className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest">Finanzielle Übersicht</span>
          <h1 className="font-headline text-[1.75rem] font-bold text-[#001939] tracking-tight">Analyse</h1>
        </div>
      </section>

      {/* Savings summary */}
      <SavingsSummary totalSavings={totalSavings} currentMonthNet={currentMonthNet} />

      {/* Category pie chart */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_-2px_rgba(25,28,29,0.05)]">
        <h2 className="font-headline font-semibold text-[#001939] mb-4">Ausgaben nach Kategorie</h2>
        <CategoryPieChart data={categoryData} />
      </div>

      {/* Stats grid */}
      <div>
        <h2 className="font-headline font-semibold text-[#001939] mb-3">Statistiken diesen Monat</h2>
        <StatsGrid stats={stats} yoyPercent={yoyPercent} />
      </div>

      {/* Monthly trend */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_-2px_rgba(25,28,29,0.05)]">
        <h2 className="font-headline font-semibold text-[#001939] mb-4">Ausgaben der letzten 6 Monate</h2>
        <MonthlyTrendChart data={trendData} />
      </div>

      {/* Budget utilization */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_-2px_rgba(25,28,29,0.05)]">
        <h2 className="font-headline font-semibold text-[#001939] mb-4">Budget-Auslastung im Verlauf</h2>
        <BudgetUtilizationChart data={utilizationData} />
      </div>
    </div>
  )
}
