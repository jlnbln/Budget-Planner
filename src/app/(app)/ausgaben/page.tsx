'use client'

import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useExpenses, useCategories } from '@/hooks/use-data'
import MonthNavigator from '@/components/ausgaben/MonthNavigator'
import ExpenseList from '@/components/ausgaben/ExpenseList'
import { formatEuro, formatMonthYear } from '@/lib/utils'

function AusgabenContent() {
  const searchParams = useSearchParams()
  const now = useMemo(() => new Date(), [])
  const month = searchParams.get('monat') ? parseInt(searchParams.get('monat')!) : now.getMonth() + 1
  const year = searchParams.get('jahr') ? parseInt(searchParams.get('jahr')!) : now.getFullYear()

  const { data: expenses = [], isLoading } = useExpenses(month, year)
  const { data: categories = [] } = useCategories()

  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])

  return (
    <div className="px-5 pt-4 pb-4 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-headline text-[1.75rem] font-bold text-[#001939] tracking-tight">Transaktionen</h1>
        <p className="text-[#43474f] text-sm mt-0.5">Behalte deine Ausgaben im Detail im Blick.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <MonthNavigator month={month} year={year} />
        </div>
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

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.length > 0 && (
            <h2 className="text-[10px] font-bold text-[#43474f] uppercase tracking-widest px-1">
              Neueste Ausgaben
            </h2>
          )}
          <ExpenseList expenses={expenses} categories={categories} />
        </div>
      )}
    </div>
  )
}

export default function AusgabenPage() {
  return (
    <Suspense>
      <AusgabenContent />
    </Suspense>
  )
}
