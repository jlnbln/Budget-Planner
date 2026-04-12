'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import EditExpenseSheet from './EditExpenseSheet'
import type { Category, ExpenseWithCategory } from '@/types/database'
import { formatEuro, formatDate } from '@/lib/utils'

interface ExpenseListProps {
  expenses: ExpenseWithCategory[]
  categories: Category[]
}

export default function ExpenseList({ expenses, categories }: ExpenseListProps) {
  const [selected, setSelected] = useState<ExpenseWithCategory | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  if (expenses.length === 0) {
    return (
      <div className="text-center py-14 text-[#43474f]">
        <p className="text-4xl mb-3">📭</p>
        <p className="font-medium">Keine Ausgaben in diesem Monat</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-[0_4px_12px_-2px_rgba(25,28,29,0.05)] overflow-hidden">
        {expenses.map((expense, index) => (
          <button
            key={expense.id}
            className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#f8f9fa] active:scale-[0.99] transition-all group ${index > 0 ? 'border-t border-[#f3f4f5]' : ''}`}
            onClick={() => {
              setSelected(expense)
              setSheetOpen(true)
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: `${expense.category?.color ?? '#e7e8e9'}25` }}
            >
              {expense.category?.emoji ?? '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#191c1d] text-sm truncate">{expense.description}</p>
              <p className="text-xs text-[#43474f]">
                {formatDate(expense.expense_date)} · {expense.category?.name ?? 'Ohne Kategorie'}
                {expense.is_favorite && ' · ⭐'}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="font-bold text-[#191c1d] text-sm tabular-nums">
                −{formatEuro(expense.amount)}
              </span>
              <Pencil className="h-3.5 w-3.5 text-[#747780] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>

      <EditExpenseSheet
        expense={selected}
        categories={categories}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  )
}
