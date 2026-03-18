'use client';

import { AlertCircle, Briefcase, Users, CheckCircle, Star } from 'lucide-react';
import { useRecruiterAnalytics } from '@/lib/queries/analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { ApplicationsOverTimeChart } from './charts/ApplicationsOverTimeChart';
import { StatusBreakdownChart } from './charts/StatusBreakdownChart';
import { TopJobsChart } from './charts/TopJobsChart';

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <Skeleton className="h-5 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
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

export function RecruiterAnalytics() {
  const { data, isLoading, error, refetch } = useRecruiterAnalytics();

  if (isLoading) return <AnalyticsSkeleton />;
  if (error) return <AnalyticsError onRetry={refetch} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="bg-sky-50 p-3 rounded-lg">
            <Briefcase className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Open Posts</p>
            <p className="text-2xl font-bold text-slate-900">{data.openPosts}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-lg">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Applicants</p>
            <p className="text-2xl font-bold text-slate-900">
              {data.statusBreakdown.reduce((s, d) => s + d.count, 0)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Shortlisted</p>
            <p className="text-2xl font-bold text-slate-900">
              {data.statusBreakdown.find((d) => d.status === 'shortlisted')?.count ?? 0}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="bg-violet-50 p-3 rounded-lg">
            <Star className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Hired</p>
            <p className="text-2xl font-bold text-slate-900">
              {data.statusBreakdown.find((d) => d.status === 'hired')?.count ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Applications Over Time — full width */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Applications Over Time</h3>
        <div className="h-64">
          <ApplicationsOverTimeChart data={data.applicationsOverTime} />
        </div>
      </div>

      {/* Status Breakdown + Top Jobs — side by side on md+ */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Application Status</h3>
          <div className="h-64">
            <StatusBreakdownChart data={data.statusBreakdown} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Top Jobs by Applicants</h3>
          <div className="h-64">
            <TopJobsChart data={data.topJobs} />
          </div>
        </div>
      </div>
    </div>
  );
}
