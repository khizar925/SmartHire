'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { PRIMARY } from './chartColors';
import type { ApplicationsOverTimePoint } from '@/lib/queries/analytics';

interface Props {
  data: ApplicationsOverTimePoint[];
}

export function ApplicationsOverTimeChart({ data }: Props) {
  const isEmpty = data.every((d) => d.count === 0);

  if (isEmpty) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
        No applications in the last 30 days
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickFormatter={(d: string) => {
            try {
              return format(parseISO(d), 'MMM d');
            } catch {
              return '';
            }
          }}
          interval={4}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          width={30}
        />
        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
          formatter={(value) => [value, 'Applications']}
          labelFormatter={(label) => {
            const s = String(label);
            try {
              return format(parseISO(s), 'MMM d, yyyy');
            } catch {
              return s;
            }
          }}
        />
        <Bar dataKey="count" fill={PRIMARY} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
