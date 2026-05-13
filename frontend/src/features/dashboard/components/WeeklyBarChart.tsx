import {
  BarChart,
  Bar,
  XAxis,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import type { IWeeklyBar } from '../interfaces/dashboard.interface'

interface WeeklyBarChartProps {
  data: IWeeklyBar[]
}

export function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748B', fontSize: 12 }}
        />
        <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isToday ? '#2563EB' : '#BFDBFE'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
