'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import type { ScoreTrendPoint } from '@/lib/queries/analytics';

interface Props {
  data: ScoreTrendPoint[];
}

const truncate = (s: string, max = 12) => (s.length > max ? s.slice(0, max) + '…' : s);

function scoreColor(score: number | null): string {
  if (score === null) return '#e2e8f0'; // slate-200 — not scored
  if (score >= 70) return '#22c55e';   // green-500
  if (score >= 50) return '#f59e0b';   // amber-500
  return '#ef4444';                    // red-500
}

interface TooltipPayload {
  payload: ScoreTrendPoint & { _score: number };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ScoreTrendPoint;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs shadow-md">
      <p className="font-medium text-slate-900 mb-1">{d.job_title}</p>
      <p className="text-slate-600">
        Score:{' '}
        {d.score !== null ? (
          <span className="font-semibold text-slate-900">{d.score.toFixed(1)}</span>
        ) : (
          <span className="text-slate-400 italic">Not scored yet</span>
        )}
      </p>
    </div>
  );
}

export function ScoreTrendChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm">
        No applications yet
      </div>
    );
  }

  // Replace null scores with 0 for rendering; store original for tooltip
  const chartData = data.map((d) => ({ ...d, _score: d.score ?? 0 }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="job_title"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickFormatter={(v: string) => truncate(v)}
          angle={-25}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          width={30}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="_score" radius={[3, 3, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={scoreColor(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
