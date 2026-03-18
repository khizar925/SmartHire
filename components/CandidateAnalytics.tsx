'use client';

import { AlertCircle } from 'lucide-react';
import { useCandidateAnalytics } from '@/lib/queries/analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBreakdownChart } from './charts/StatusBreakdownChart';
import { ScoreTrendChart } from './charts/ScoreTrendChart';

function AnalyticsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

function AnalyticsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-900">Failed to load analytics</p>
          <button
            onClick={onRetry}
            className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export function CandidateAnalytics() {
  const { data, isLoading, error, refetch } = useCandidateAnalytics();

  if (isLoading) return <AnalyticsSkeleton />;
  if (error) return <AnalyticsError onRetry={refetch} />;
  if (!data) return null;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Application Status</h3>
        <div className="h-64">
          <StatusBreakdownChart data={data.statusSummary} />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Score Trend</h3>
        <div className="h-64">
          <ScoreTrendChart data={data.scoreTrend} />
        </div>
      </div>
    </div>
  );
}
