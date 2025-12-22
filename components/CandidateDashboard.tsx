// components/CandidateDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Loader2, AlertCircle, MapPin, Clock, Users, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { formatTimeAgo, isNewJob } from '@/lib/date-utils';
import type { Job } from '@/types';

interface PaginatedJobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export function CandidateDashboard({ firstName }: { firstName?: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'server' | 'empty' | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 12;

  useEffect(() => {
    fetchJobs(page);
  }, [page]);

  const fetchJobs = async (currentPage: number) => {
    setIsLoading(true);
    setError(null);
    setErrorType(null);

    try {
      const response = await fetch(`/api/jobs/public?page=${currentPage}&limit=${limit}`);
      const data: PaginatedJobsResponse | { error?: string; details?: string[] } = await response.json();

      if (!response.ok) {
        // Determine error type
        if (response.status >= 500) {
          setErrorType('server');
          setError('Failed to load jobs. Please try again.');
        } else {
          setErrorType('server');
          setError('error' in data ? data.error || 'Failed to load jobs. Please try again.' : 'Failed to load jobs. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // Type guard to ensure data is PaginatedJobsResponse
      if (!('jobs' in data)) {
        setErrorType('server');
        setError('Failed to load jobs. Please try again.');
        setIsLoading(false);
        return;
      }

      if (data.jobs.length === 0 && currentPage === 1) {
        setErrorType('empty');
        setError('No active jobs available right now. Check back soon!');
        setJobs([]);
        setTotal(0);
        setTotalPages(0);
        setHasMore(false);
      } else {
        setJobs(data.jobs);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setHasMore(data.hasMore);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setErrorType('network');
      setError('Connection failed. Please check your internet.');
      setIsLoading(false);
    }
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getStartIndex = () => {
    return total === 0 ? 0 : (page - 1) * limit + 1;
  };

  const getEndIndex = () => {
    return Math.min(page * limit, total);
  };

  return (
    <div className="space-y-6">

      {/* Available Jobs Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Available Jobs</h2>
          {!isLoading && !errorType && total > 0 && (
            <span className="text-sm text-slate-600">
              Showing {getStartIndex()}-{getEndIndex()} of {total} jobs
            </span>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        )}

        {/* Error State - Network */}
        {errorType === 'network' && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">{error}</p>
                <button
                  onClick={() => fetchJobs(page)}
                  className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error State - Server */}
        {errorType === 'server' && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">{error}</p>
                <button
                  onClick={() => fetchJobs(page)}
                  className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {errorType === 'empty' && !isLoading && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No active jobs available</h3>
            <p className="text-slate-600">Check back soon for new opportunities!</p>
          </div>
        )}

        {/* Jobs Grid */}
        {!isLoading && !errorType && jobs.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {jobs.map((job) => {
                const isNew = isNewJob(job.created_at);
                return (
                  <div
                    key={job.id}
                    className="flex flex-col h-full border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 pr-2">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          {job.job_title}
                        </h3>
                        <p className="text-sm font-medium text-slate-700">
                          {job.company_name}
                        </p>
                      </div>
                      {isNew && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white flex-shrink-0">
                          New
                        </span>
                      )}
                    </div>

                    {/* Job Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{job.job_location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="capitalize">{job.employment_type.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span>{job.applicants_count} {job.applicants_count === 1 ? 'applicant' : 'applicants'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>Posted {formatTimeAgo(job.created_at)}</span>
                      </div>
                    </div>

                    {/* Description Preview */}
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                      {truncateDescription(job.job_description)}
                    </p>

                    {/* Apply Now Button */}
                    <Button
                      variant="primary"
                      className="w-full mt-auto"
                      onClick={() => {
                        // TODO: Implement application functionality
                        alert('Application feature coming soon!');
                      }}
                    >
                      Apply Now
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!hasMore}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

