// components/JobDetailsModal.tsx
'use client';

import { X, MapPin, Clock, Users, Calendar, Briefcase } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Job } from '@/types';

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

export function JobDetailsModal({ isOpen, onClose, job }: JobDetailsModalProps) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
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

  const formatEmploymentType = (type: string) => {
    return type.replace('-', ' ').split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!isOpen || !job) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <Briefcase className="h-6 w-6 text-primary-600 flex-shrink-0" />
            <h2 className="text-2xl font-bold text-slate-900 flex-1">{job.job_title}</h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                job.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {job.status === 'active' ? 'Active' : 'Closed'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors ml-4"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {/* Company Name */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Company</h3>
              <p className="text-slate-700">{job.company_name}</p>
            </div>

            {/* Details Grid */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
                    Location
                  </p>
                  <p className="text-sm font-medium text-slate-900">{job.job_location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Clock className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
                    Employment Type
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatEmploymentType(job.employment_type)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Users className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
                    Applicants
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {job.applicants_count} {job.applicants_count === 1 ? 'applicant' : 'applicants'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
                    Posted Date
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDate(job.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Job Description</h3>
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {job.job_description}
                </ReactMarkdown>
              </div>
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
                <div>
                  <span className="font-medium">Created:</span> {formatDate(job.created_at)}
                </div>
                {job.updated_at && job.updated_at !== job.created_at && (
                  <div>
                    <span className="font-medium">Last updated:</span> {formatDate(job.updated_at)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
