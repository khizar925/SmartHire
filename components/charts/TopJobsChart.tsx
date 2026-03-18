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
import { PRIMARY } from './chartColors';
import type { TopJobPoint } from '@/lib/queries/analytics';

interface Props {
  data: TopJobPoint[];
}

const truncate = (s: string, max = 20) => (s.length > max ? s.slice(0, max) + '…' : s);

export function TopJobsChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
        No jobs posted yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
        />
        <YAxis
          type="category"
          dataKey="job_title"
          width={130}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: '#64748b' }}
          tickFormatter={(v: string) => truncate(v)}
        />
        <Tooltip
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
          formatter={(value) => [value, 'Applicants']}
        />
        <Bar dataKey="applicants_count" fill={PRIMARY} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
