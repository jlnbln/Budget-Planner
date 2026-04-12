'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatEuro } from '@/lib/utils'

interface CategoryData {
  name: string
  emoji: string
  color: string
  amount: number
}

interface CategoryPieChartProps {
  data: CategoryData[]
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Noch keine Ausgaben mit Kategorien
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={2}
            dataKey="amount"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [formatEuro(Number(value)), 'Betrag']}
            contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Category list */}
      <div className="space-y-2 mt-2">
        {data.sort((a, b) => b.amount - a.amount).map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm truncate">{item.emoji} {item.name}</span>
            </div>
            <span className="text-sm font-semibold tabular-nums">{formatEuro(item.amount)}</span>
            <span className="text-xs text-muted-foreground w-10 text-right">
              {total > 0 ? Math.round((item.amount / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
