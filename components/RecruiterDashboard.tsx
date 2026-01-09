// components/RecruiterDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Loader2, AlertCircle, MapPin, Clock, Users, Calendar, Plus } from 'lucide-react';
import { Button } from './Button';
import { PostJobModal } from './PostJobModal';
import { JobDetailsModal } from './JobDetailsModal';
import type { Job } from '@/types';

export function RecruiterDashboard({ firstName }: { firstName?: string }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);


  useEffect (() => {
    fetchJobs();
  }, []);

  const handleJobPosted = () => {
    fetchJobs();
  };

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load jobs');
        setIsLoading(false);
        return;
      }

      setJobs(data.jobs || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <>
      <div className="space-y-6">
        {/* Job Posting Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Job Postings</h2>
            {jobs.length > 0 && (
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900">{error}</p>
                  <button
                    onClick={fetchJobs}
                    className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && jobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs posted yet</h3>
              <p className="text-slate-600 mb-4">Get started by posting your first job opening.</p>
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
              >
                Post Your First Job
              </Button>
            </div>
          )}

          {/* Jobs Grid */}
          {!isLoading && !error && jobs.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 flex-1 pr-2">
                      {job.job_title}
                    </h3>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${job.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700'
                        }`}
                    >
                      {job.status === 'active' ? 'Active' : 'Closed'}
                    </span>
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
                      <span>Posted {formatDate(job.created_at)}</span>
                    </div>
                  </div>

                  {/* Description Preview */}
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                    {truncateDescription(job.job_description)}
                  </p>

                  {/* View Details Button */}
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      setSelectedJob(job);
                      setIsDetailsModalOpen(true);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <PostJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onJobposted={handleJobPosted} // Pass the callback
      />

      <JobDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
      />
    </>
  );
}

