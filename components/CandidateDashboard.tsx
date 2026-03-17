// components/CandidateDashboard.tsx
'use client';

import { useState } from 'react';
import { Briefcase, Loader2, AlertCircle, MapPin, Clock, Users, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { formatTimeAgo, isNewJob } from '@/lib/date-utils';
import type { Job } from '@/types';
import Link from 'next/link';
import { usePublicJobs } from '@/lib/queries/jobs';

export function CandidateDashboard(_props: { firstName?: string }) {
  const [page, setPage] = useState(1);
  const publicLink = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const limit = 12;

  const { data, isLoading, error, refetch } = usePublicJobs(page);

  const jobs       = data?.jobs       ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const hasMore    = data?.hasMore    ?? false;

  const isEmpty = !isLoading && !error && jobs.length === 0;
  const isError = !!error;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getStartIndex = () => (total === 0 ? 0 : (page - 1) * limit + 1);
  const getEndIndex   = () => Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Available Jobs</h2>
          {!isLoading && !isError && total > 0 && (
            <span className="text-sm text-slate-600 hidden sm:inline">
              Showing {getStartIndex()}–{getEndIndex()} of {total} jobs
            </span>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        )}

        {isError && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">Failed to load jobs. Please try again.</p>
                <button onClick={() => refetch()} className="mt-2 text-sm text-red-700 hover:text-red-900 underline">
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {isEmpty && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No active jobs available</h3>
            <p className="text-slate-600">Check back soon for new opportunities!</p>
          </div>
        )}

        {!isLoading && !isError && jobs.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {jobs.map((job: Job) => {
                const isNew = isNewJob(job.created_at);
                return (
                  <div key={job.id} className="flex flex-col h-full border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 pr-2">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{job.job_title}</h3>
                        <p className="text-sm font-medium text-slate-700">{job.company_name}</p>
                      </div>
                      {isNew && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white flex-shrink-0">New</span>
                      )}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 flex-shrink-0" /><span>{job.job_location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4 flex-shrink-0" /><span className="capitalize">{job.employment_type.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4 flex-shrink-0" /><span>{job.applicants_count} {job.applicants_count === 1 ? 'applicant' : 'applicants'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4 flex-shrink-0" /><span>Posted {formatTimeAgo(job.created_at)}</span>
                      </div>
                    </div>

                    <Link href={`${publicLink}/jobs/${job.id}?apply=true`}>
                      <Button variant="primary" className="w-full mt-auto">Apply Now</Button>
                    </Link>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" />Previous
                  </Button>
                  <Button variant="secondary" onClick={() => handlePageChange(page + 1)} disabled={!hasMore} className="flex items-center gap-1">
                    Next<ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-slate-600">Page {page} of {totalPages}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
