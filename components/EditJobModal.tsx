// components/EditJobModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Pencil } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { useUpdateJob } from '@/lib/mutations/jobs';
import type { Job } from '@/types';

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

export function EditJobModal({ isOpen, onClose, job }: EditJobModalProps) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    job_title: '',
    company_name: '',
    job_location: '',
    employment_type: '',
    experience_level: '',
    skills: '',
    job_description: '',
    status: 'active',
  });
  const [errorDetails, setErrorDetails] = useState<string[]>([]);

  const updateJob = useUpdateJob();

  useEffect(() => { setMounted(true); }, []);

  // Pre-fill form when job changes
  useEffect(() => {
    if (job) {
      setFormData({
        job_title: job.job_title,
        company_name: job.company_name,
        job_location: job.job_location,
        employment_type: job.employment_type,
        experience_level: job.experience_level,
        skills: job.skills,
        job_description: job.job_description,
        status: job.status,
      });
      setErrorDetails([]);
    }
  }, [job]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorDetails.length) setErrorDetails([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setErrorDetails([]);

    try {
      await updateJob.mutateAsync({ id: job.id, ...formData });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          setErrorDetails(parsed.details || [parsed.error || 'Failed to update job']);
        } catch {
          setErrorDetails([err.message || 'Failed to update job']);
        }
      } else {
        setErrorDetails(['An unexpected error occurred']);
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      <div className="relative z-[1000] w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in duration-300 mt-auto sm:mt-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600/10 p-2 rounded-xl">
              <Pencil className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif tracking-tight">Edit Job</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {errorDetails.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {errorDetails.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="job_title" className="block text-sm font-semibold text-slate-900 mb-2">Job Title *</label>
              <input type="text" id="job_title" name="job_title" value={formData.job_title} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>

            <div>
              <label htmlFor="company_name" className="block text-sm font-semibold text-slate-900 mb-2">Company Name *</label>
              <input type="text" id="company_name" name="company_name" value={formData.company_name} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>

            <div>
              <label htmlFor="job_location" className="block text-sm font-semibold text-slate-900 mb-2">Location *</label>
              <input type="text" id="job_location" name="job_location" value={formData.job_location} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>

            <div>
              <label htmlFor="employment_type" className="block text-sm font-semibold text-slate-900 mb-2">Employment Type *</label>
              <select id="employment_type" name="employment_type" value={formData.employment_type} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="">Select employment type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>

            <div>
              <label htmlFor="experience_level" className="block text-sm font-semibold text-slate-900 mb-2">Experience Level *</label>
              <select id="experience_level" name="experience_level" value={formData.experience_level} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="">Select experience level</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="lead">Lead/Manager</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-slate-900 mb-2">Status *</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-semibold text-slate-900 mb-2">Required Skills *</label>
              <input type="text" id="skills" name="skills" value={formData.skills} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              <p className="mt-1.5 text-xs text-slate-500">Separate skills with commas. At least 3 are required.</p>
            </div>

            <div>
              <label htmlFor="job_description" className="block text-sm font-semibold text-slate-900 mb-2">Job Description *</label>
              <textarea id="job_description" name="job_description" value={formData.job_description} onChange={handleChange} required rows={6}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={updateJob.isPending}>
              {updateJob.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
              ) : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
