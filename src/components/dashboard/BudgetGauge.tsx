'use client'

import { getGaugeColor } from '@/lib/calculations'
import { formatEuro } from '@/lib/utils'

interface BudgetGaugeProps {
  spent: number
  budget: number
}

export default function BudgetGauge({ spent, budget }: BudgetGaugeProps) {
  const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const remaining = budget - spent
  const isOver = spent > budget

  // Use Stitch color for good standing, red for over budget
  const isWarning = percent >= 80
  const barColor = isOver
    ? 'bg-[#ba1a1a]'
    : isWarning
    ? 'bg-amber-500'
    : 'bg-gradient-to-r from-[#001939] to-[#002d5e]'

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)] border border-[#c3c6d0]/10 relative overflow-hidden">
      {/* Soft glow accent */}
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#beead1]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative space-y-5">
        {/* Label */}
        <span className="text-[10px] font-bold text-[#002d5e] tracking-widest uppercase">
          Monatsbudget
        </span>

        {/* Big number + budget reference */}
        <div className="flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <span className="font-headline text-[2.75rem] font-bold leading-none tracking-tight text-[#001939]">
              {formatEuro(spent)}
            </span>
          </div>
          <p className="text-[#43474f] text-sm font-medium">
            von <span className="text-[#001939] font-bold">{formatEuro(budget)}</span> diesen Monat ausgegeben
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-[#e7e8e9] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full shadow-sm transition-all duration-700 ${barColor}`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-semibold text-[#43474f]">
            <span>{Math.round(percent)}% verbraucht</span>
            <span className={isOver ? 'text-[#ba1a1a]' : 'text-[#3f6653]'}>
              {isOver
                ? `${formatEuro(Math.abs(remaining))} überzogen`
                : `${formatEuro(remaining)} verbleibend`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
