'use client'

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'

interface UtilizationData {
  label: string
  percent: number
}

interface BudgetUtilizationChartProps {
  data: UtilizationData[]
}

export default function BudgetUtilizationChart({ data }: BudgetUtilizationChartProps) {
  if (data.length === 0) {
    return <div className="text-center py-4 text-muted-foreground text-sm">Keine Daten</div>
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          domain={[0, 'auto']}
          width={40}
        />
        <Tooltip
          formatter={(value) => [`${Math.round(Number(value))}%`, 'Budget-Auslastung']}
          contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
        />
        <ReferenceLine
          y={100}
          stroke="#ef4444"
          strokeDasharray="4 4"
          label={{ value: '100%', fontSize: 10, fill: '#ef4444' }}
        />
        <Line
          type="monotone"
          dataKey="percent"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#6366f1' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
