// components/RecruiterDashboard.tsx
'use client';

import { useState } from 'react';
import { Briefcase, Loader2, AlertCircle, MapPin, Clock, Users, Calendar, Plus, Trash2, Pencil } from 'lucide-react';
import { RecruiterAnalytics } from './RecruiterAnalytics';
import { Button } from './Button';
import { PostJobModal } from './PostJobModal';
import { EditJobModal } from './EditJobModal';
import { JobDetailsModal } from './JobDetailsModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { useRecruiterJobs } from '@/lib/queries/jobs';
import { useDeleteJob } from '@/lib/mutations/jobs';
import type { Job } from '@/types';

export function RecruiterDashboard(_props: { firstName?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);

  const { data: jobs = [], isLoading, error, refetch } = useRecruiterJobs();
  const deleteJob = useDeleteJob();

  const handleEdit = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    setJobToEdit(job);
    setIsEditModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    setJobToDelete(job);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      await deleteJob.mutateAsync(jobToDelete.id);
      setIsDeleteModalOpen(false);
      setJobToDelete(null);
    } catch {
      alert('Failed to delete job');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const truncateDescription = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const isJobActive = (job: Job) => {
    if (job.status !== 'active') return false;
    const ageInDays = (Date.now() - new Date(job.created_at).getTime()) / 86_400_000;
    return ageInDays <= 30;
  };

  return (
    <>
      <div className="space-y-6">
        {/* Top action bar */}
        <div className="flex items-center justify-between">
          <div />
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>

        {/* Analytics section — always visible */}
        <RecruiterAnalytics />

        {/* Job Postings section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Job Postings</h2>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900">Failed to load jobs</p>
                  <button onClick={() => refetch()} className="mt-2 text-sm text-red-700 hover:text-red-900 underline">
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && jobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs posted yet</h3>
              <p className="text-slate-600 mb-4">Get started by posting your first job opening.</p>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Post Your First Job
              </Button>
            </div>
          )}

          {!isLoading && !error && jobs.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job: Job) => (
                <div
                  key={job.id}
                  className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate pr-2" title={job.job_title}>
                        {job.job_title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {isJobActive(job) && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 bg-green-100 text-green-700">
                          New
                        </span>
                      )}
                      <button
                        onClick={(e) => handleEdit(e, job)}
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all"
                        title="Edit job posting"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, job)}
                        disabled={deleteJob.isPending && jobToDelete?.id === job.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all disabled:opacity-50"
                        title="Delete job posting"
                      >
                        {deleteJob.isPending && jobToDelete?.id === job.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

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

                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                    {truncateDescription(job.job_description)}
                  </p>

                  <Button
                    variant="primary"
                    className="w-full mt-auto"
                    onClick={() => { setSelectedJob(job); setIsDetailsModalOpen(true); }}
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
        onJobposted={() => {}} // invalidation handled by mutation
      />

      <EditJobModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setJobToEdit(null); }}
        job={jobToEdit}
      />

      <JobDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => { setIsDetailsModalOpen(false); setSelectedJob(null); }}
        job={selectedJob}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        isDeleting={deleteJob.isPending}
        onClose={() => { setIsDeleteModalOpen(false); setJobToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Job Posting"
        message={`Are you sure you want to delete "${jobToDelete?.job_title}"? This action cannot be undone.`}
      />
    </>
  );
}
