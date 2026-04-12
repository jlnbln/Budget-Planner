import { formatEuro } from '@/lib/utils'
import type { MonthlyStats } from '@/types/database'

interface StatsGridProps {
  stats: MonthlyStats
  yoyPercent: number | null
}

interface StatCardProps {
  label: string
  value: string
  sub?: string
  highlight?: 'good' | 'bad' | 'neutral'
}

function StatCard({ label, value, sub, highlight = 'neutral' }: StatCardProps) {
  const color =
    highlight === 'good' ? 'text-green-600'
    : highlight === 'bad' ? 'text-red-500'
    : 'text-foreground'

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-muted-foreground mb-1 leading-tight">{label}</p>
      <p className={`text-lg font-bold tabular-nums leading-tight ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}

export default function StatsGrid({ stats, yoyPercent }: StatsGridProps) {
  const {
    utilizationPercent,
    avgDailySpend,
    biggestExpense,
    daysLeft,
    dailyBudgetLeft,
  } = stats

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        label="Tagesdurchschnitt"
        value={formatEuro(avgDailySpend)}
        sub="pro Tag diesen Monat"
      />
      <StatCard
        label="Budget-Auslastung"
        value={`${Math.round(utilizationPercent)}%`}
        sub="des Monatsbudgets"
        highlight={
          utilizationPercent >= 100 ? 'bad'
          : utilizationPercent >= 80 ? 'neutral'
          : 'good'
        }
      />
      <StatCard
        label="Größte Ausgabe"
        value={biggestExpense ? formatEuro(biggestExpense.amount) : '—'}
        sub={biggestExpense?.description ?? undefined}
      />
      <StatCard
        label="Verbleibende Tage"
        value={`${daysLeft} ${daysLeft === 1 ? 'Tag' : 'Tage'}`}
        sub="bis Monatsende"
      />
      <StatCard
        label="Tagesbudget übrig"
        value={formatEuro(Math.max(dailyBudgetLeft, 0))}
        sub="pro verbleibendem Tag"
        highlight={dailyBudgetLeft < 0 ? 'bad' : dailyBudgetLeft < 5 ? 'neutral' : 'good'}
      />
      <StatCard
        label="Vorjahresvergleich"
        value={yoyPercent !== null ? `${yoyPercent > 0 ? '+' : ''}${Math.round(yoyPercent)}%` : '—'}
        sub={yoyPercent !== null
          ? yoyPercent > 0 ? 'mehr als letztes Jahr' : 'weniger als letztes Jahr'
          : 'Keine Vorjahresdaten'
        }
        highlight={
          yoyPercent === null ? 'neutral'
          : yoyPercent > 10 ? 'bad'
          : yoyPercent < -5 ? 'good'
          : 'neutral'
        }
      />
    </div>
  )
}
