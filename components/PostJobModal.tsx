// components/PostJobModal.tsx
'use client';

import { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobposted: () => void;
}

export function PostJobModal({ isOpen, onClose, onJobposted }: PostJobModalProps) {
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    location: '',
    employmentType: '',
    experienceLevel: '',
    skills: '',
    jobDescription: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const publicLink = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const [publicLinkStatus, setPublicLinkStatus] = useState(false)

  function formatJobDescriptionToMarkdown(content: string): string {
    if (!content || typeof content !== 'string') return '';

    content = content.trim().replace(/\r\n/g, '\n').replace(/\t/g, '    ');

    const hasMarkdownHeaders = /^#{1,6}\s+.+$/m.test(content);
    const hasMarkdownLists = /^\s*[-*+]\s+.+$/m.test(content);
    const hasMarkdownBold = /\*\*.+?\*\*/.test(content);

    if (hasMarkdownHeaders || (hasMarkdownLists && hasMarkdownBold)) {
      return content
        .replace(/([^\n])(#{1,6}\s+)/g, '$1\n\n$2')
        .replace(/(#{1,6}\s+.+?)(\n)([^\n#])/g, '$1\n\n$3')
        .replace(/([^\n\s*-])(\n[-*+]\s+)/g, '$1\n\n$2')
        .replace(/[ \t]+$/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim() + '\n';
    }

    const lines = content.split('\n');
    const result: string[] = [];
    let inList = false;
    let previousWasBlank = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';

      if (line === '') {
        if (!previousWasBlank && result.length > 0) {
          result.push('');
          previousWasBlank = true;
        }
        inList = false;
        continue;
      }

      previousWasBlank = false;

      const isShort = line.length < 80;
      const hasNoEndPunctuation = !/[.!?]$/.test(line);
      const isAllCaps = line === line.toUpperCase() && /[A-Z]/.test(line);
      const endsWithColon = line.endsWith(':');
      const matchesHeaderPattern = /^(Overview|Summary|Description|Responsibilities|Requirements|Qualifications|Skills|Benefits|About|Role|Position|Duties|Experience|Education|Salary|Career|Tools|Technologies|Key|Primary|Core|Technical|Soft|Preferred|Required)/i.test(line);

      const isHeader = (matchesHeaderPattern && isShort) || (isAllCaps && isShort && hasNoEndPunctuation) || (endsWithColon && isShort);

      if (isHeader) {
        if (inList) {
          result.push('');
          inList = false;
        }

        const level = /^(Overview|Key Responsibilities|Requirements|Qualifications|Skills|About|Benefits|Salary|Career Path|Tools|Technologies)/i.test(line) ? 2 : 3;
        const headerText = line.replace(/:+$/, '').trim();

        if (result.length > 0 && result[result.length - 1] !== '') result.push('');
        result.push(`${'#'.repeat(level)} ${headerText}`);
        result.push('');
        continue;
      }

      const isList = /^[-•*+‣▸▹►▪▫]\s+/.test(line) || /^\d+\.\s+/.test(line) || /^[a-z]\.\s+/i.test(line) || (/^(\s{2,}|\t)/.test(line) && line.length < 150);

      if (isList) {
        if (!inList && result.length > 0 && result[result.length - 1] !== '') result.push('');
        inList = true;
        const listItem = line.replace(/^[-•*+‣▸▹►▪▫]\s+/, '').replace(/^\d+\.\s+/, '').replace(/^[a-z]\.\s+/i, '').replace(/^\s+/, '').trim();
        result.push(`- ${listItem}`);
        continue;
      }

      if (inList) {
        result.push('');
        inList = false;
      }

      const formattedLine = line.includes('**') ? line : line.replace(/^([A-Z][a-zA-Z\s&]+):/g, '**$1**:');
      result.push(formattedLine);
    }

    return result.join('\n').trim() + '\n';
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
      setErrorDetails([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setErrorDetails([]);

    try {
      const formattedJobDescription = formatJobDescriptionToMarkdown(formData.jobDescription);
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_title: formData.jobTitle,
          company_name: formData.companyName,
          job_location: formData.location,
          employment_type: formData.employmentType,
          experience_level: formData.experienceLevel,
          skills: formData.skills,
          job_description: formattedJobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response
        setError('Failed to create job');
        setErrorDetails(data.details || []);
        setIsLoading(false);
        return;
      }

      // Success: Store job ID and construct proper link
      setCreatedJobId(data.job?.id || null);

      // Success: Reset form and close modal
      setFormData({
        jobTitle: '',
        companyName: '',
        location: '',
        employmentType: '',
        experienceLevel: '',
        skills: '',
        jobDescription: '',
      });
      setIsLoading(false);
      onJobposted();
      setPublicLinkStatus(true);
    } catch (err) {
      console.error('Error submitting job:', err);
      setError('Failed to create job');
      setErrorDetails(['Network error. Please check your connection and try again.']);
      setIsLoading(false);
    }
  };

  const jobLink = createdJobId ? `${publicLink}/jobs/${createdJobId}` : publicLink || '';

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOnCloseLinkModal = () => {
    setPublicLinkStatus(false);
    setCreatedJobId(null);
    onClose();
  }

  const handleOnClosePostModal = () => {
    setFormData({
      jobTitle: '',
      companyName: '',
      location: '',
      employmentType: '',
      experienceLevel: '',
      skills: '',
      jobDescription: '',
    });
    setCreatedJobId(null);
    setPublicLinkStatus(false);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
        {publicLinkStatus ? <div>
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Public Link</h2>
            <button
              onClick={handleOnCloseLinkModal}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Your job posting is live! Share this link:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={jobLink}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(jobLink || publicLink || '');
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </div> : <div>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">Post a New Job</h2>
            <button
              onClick={handleOnClosePostModal}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900 mb-1">{error}</p>
                      {errorDetails.length > 0 && (
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                          {errorDetails.map((detail, index) => (
                            <li key={index}>{detail}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Job Title */}
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-semibold text-slate-900 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-semibold text-slate-900 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Tech Corp Inc."
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-slate-900 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>

              {/* Employment Type */}
              <div>
                <label htmlFor="employmentType" className="block text-sm font-semibold text-slate-900 mb-2">
                  Employment Type *
                </label>
                <select
                  id="employmentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select employment type</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label htmlFor="experienceLevel" className="block text-sm font-semibold text-slate-900 mb-2">
                  Experience Level *
                </label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select experience level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead/Manager</option>
                </select>
              </div>

              {/* Skills */}
              <div>
                <label htmlFor="skills" className="block text-sm font-semibold text-slate-900 mb-2">
                  Required Skills *
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., React, TypeScript, Node.js (Min. 3)"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Separate skills with commas. At least 3 are required for AI matching.
                </p>
              </div>

              {/* Job Description */}
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-semibold text-slate-900 mb-2">
                  Job Description *
                </label>
                <textarea
                  id="jobDescription"
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Describe the job responsibilities, requirements, and what you're looking for..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
              <Button
                type="button"
                variant="secondary"
                onClick={handleOnClosePostModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  'Post Job'
                )}
              </Button>
            </div>
          </form>
        </div>}

      </div>
    </div>
  );
}