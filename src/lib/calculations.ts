import { getDaysInMonth } from 'date-fns'
import type { ExpenseWithCategory, MonthlySavings, MonthlyStats } from '@/types/database'

export function computeMonthlyStats(
  expenses: ExpenseWithCategory[],
  budget: number,
  month: number,
  year: number
): MonthlyStats {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const utilizationPercent = budget > 0 ? (totalSpent / budget) * 100 : 0

  const today = new Date()
  const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year
  const dayOfMonth = isCurrentMonth ? today.getDate() : getDaysInMonth(new Date(year, month - 1))
  const daysInMonth = getDaysInMonth(new Date(year, month - 1))
  const daysLeft = isCurrentMonth ? daysInMonth - today.getDate() : 0

  const avgDailySpend = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0
  const budgetRemaining = budget - totalSpent
  const dailyBudgetLeft = daysLeft > 0 ? budgetRemaining / daysLeft : budgetRemaining

  const biggestExpense = expenses.length > 0
    ? expenses.reduce((max, e) => e.amount > max.amount ? e : max, expenses[0])
    : null

  return {
    totalSpent,
    budget,
    utilizationPercent,
    avgDailySpend,
    biggestExpense,
    daysLeft,
    dailyBudgetLeft,
  }
}

export function computeAccumulatedSavings(
  pastSavings: MonthlySavings[],
  currentMonthSpent: number,
  currentBudget: number
): number {
  const pastTotal = pastSavings.reduce((sum, s) => sum + s.net_savings, 0)
  const currentNet = currentBudget - currentMonthSpent
  return pastTotal + currentNet
}

export function getGaugeColor(percent: number): string {
  if (percent >= 100) return '#ef4444'  // red-500
  if (percent >= 90) return '#f97316'   // orange-500
  if (percent >= 70) return '#eab308'   // yellow-500
  return '#22c55e'                       // green-500
}
