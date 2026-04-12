import { createClient } from '@/lib/supabase/server'
import MonthNavigator from '@/components/ausgaben/MonthNavigator'
import ExpenseList from '@/components/ausgaben/ExpenseList'
import type { ExpenseWithCategory } from '@/types/database'
import { formatEuro, formatMonthYear } from '@/lib/utils'
import { format, endOfMonth } from 'date-fns'

interface AusgabenPageProps {
  searchParams: Promise<{ monat?: string; jahr?: string }>
}

export default async function AusgabenPage({ searchParams }: AusgabenPageProps) {
  const params = await searchParams
  const now = new Date()
  const month = params.monat ? parseInt(params.monat) : now.getMonth() + 1
  const year = params.jahr ? parseInt(params.jahr) : now.getFullYear()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
  const monthEnd = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd')

  const [expensesResult, categoriesResult] = await Promise.all([
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
  ])

  const expenses = (expensesResult.data ?? []) as ExpenseWithCategory[]
  const categories = categoriesResult.data ?? []
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="px-5 pt-4 pb-4 max-w-2xl mx-auto space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="font-headline text-[1.75rem] font-bold text-[#001939] tracking-tight">Transaktionen</h1>
        <p className="text-[#43474f] text-sm mt-0.5">Behalte deine Ausgaben im Detail im Blick.</p>
      </div>

      {/* Filter + total — bento grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Month navigator spans 2 cols */}
        <div className="sm:col-span-2">
          <MonthNavigator month={month} year={year} />
        </div>
        {/* Total card */}
        {expenses.length > 0 && (
          <div className="bg-gradient-to-br from-[#001939] to-[#002d5e] text-white p-5 rounded-xl flex flex-col justify-between shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-75">Gesamtausgaben</span>
            <div className="mt-3">
              <span className="font-headline text-xl font-bold">{formatEuro(totalSpent)}</span>
              <p className="text-xs opacity-60 mt-0.5 capitalize">{formatMonthYear(month, year)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Expense list */}
      <div className="space-y-2">
        {expenses.length > 0 && (
          <h2 className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest px-1">
            Neueste Ausgaben
          </h2>
        )}
        <ExpenseList expenses={expenses} categories={categories} />
      </div>
    </div>
  )
}
