import { formatEuro } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface SavingsSummaryProps {
  totalSavings: number
  currentMonthNet: number
}

export default function SavingsSummary({ totalSavings, currentMonthNet }: SavingsSummaryProps) {
  const isPositive = totalSavings >= 0
  const isCurrentPositive = currentMonthNet >= 0

  return (
    <div
      className="rounded-2xl p-6 text-white"
      style={{
        background: isPositive
          ? 'linear-gradient(135deg, #22c55e, #16a34a)'
          : 'linear-gradient(135deg, #ef4444, #b91c1c)',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">Gesamte Ersparnisse</p>
          <p className="text-4xl font-bold mt-1 tabular-nums">
            {isPositive ? '' : '−'}{formatEuro(Math.abs(totalSavings))}
          </p>
        </div>
        <div className="bg-white/20 rounded-full p-2">
          {isPositive
            ? <TrendingUp className="h-6 w-6" />
            : <TrendingDown className="h-6 w-6" />
          }
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-sm text-white/70">Dieser Monat</p>
        <p className={`text-lg font-semibold ${isCurrentPositive ? 'text-white' : 'text-red-200'}`}>
          {isCurrentPositive ? '+' : ''}{formatEuro(currentMonthNet)}
        </p>
      </div>
    </div>
  )
}
