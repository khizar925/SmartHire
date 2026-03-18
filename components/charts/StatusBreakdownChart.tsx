'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { STATUS_COLORS, FALLBACK_COLOR } from './chartColors';
import type { StatusBreakdownPoint } from '@/lib/queries/analytics';

interface Props {
  data: StatusBreakdownPoint[];
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function StatusBreakdownChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
        No applications yet
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell
              key={entry.status}
              fill={STATUS_COLORS[entry.status] ?? FALLBACK_COLOR}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
          formatter={(value, name) => [
            `${value} (${((Number(value) / total) * 100).toFixed(1)}%)`,
            capitalize(String(name)),
          ]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 11, color: '#64748b' }}>{capitalize(value)}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
