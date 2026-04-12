'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'
import { formatEuroShort } from '@/lib/utils'

interface TrendData {
  label: string
  spent: number
  budget: number
}

interface MonthlyTrendChartProps {
  data: TrendData[]
}

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  if (data.length === 0) {
    return <div className="text-center py-4 text-muted-foreground text-sm">Keine Daten</div>
  }

  const maxBudget = Math.max(...data.map(d => d.budget))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatEuroShort}
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip
          formatter={(value) => [formatEuroShort(Number(value)), 'Ausgaben']}
          contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
        />
        <ReferenceLine
          y={maxBudget}
          stroke="#94a3b8"
          strokeDasharray="4 4"
          label={{ value: 'Budget', fontSize: 10, fill: '#94a3b8' }}
        />
        <Bar dataKey="spent" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.spent > entry.budget ? '#ef4444' : '#22c55e'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
