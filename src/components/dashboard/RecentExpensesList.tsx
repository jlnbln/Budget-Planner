import type { ExpenseWithCategory } from '@/types/database'
import { formatEuro, formatDateShort } from '@/lib/utils'

interface RecentExpensesListProps {
  expenses: ExpenseWithCategory[]
}

export default function RecentExpensesList({ expenses }: RecentExpensesListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-10 text-[#43474f]">
        <p className="text-3xl mb-2">🛍️</p>
        <p className="text-sm">Noch keine Ausgaben diesen Monat</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_12px_-2px_rgba(25,28,29,0.04)] overflow-hidden">
      {expenses.map((expense, index) => (
        <div
          key={expense.id}
          className={`flex items-center gap-4 px-5 py-4 ${index > 0 ? 'border-t border-[#f3f4f5]' : ''}`}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
            style={{ backgroundColor: `${expense.category?.color ?? '#e7e8e9'}25` }}
          >
            {expense.category?.emoji ?? '📦'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#191c1d] text-sm truncate">{expense.description}</p>
            <p className="text-xs text-[#43474f]">
              {expense.category?.name ?? 'Ohne Kategorie'} · {formatDateShort(expense.expense_date)}
            </p>
          </div>
          <span className="font-bold text-[#191c1d] text-sm tabular-nums flex-shrink-0">
            −{formatEuro(expense.amount)}
          </span>
        </div>
      ))}
    </div>
  )
}
