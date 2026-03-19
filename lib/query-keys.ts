export const queryKeys = {
  jobs:             () => ['jobs'] as const,
  publicJobs:       (page: number, search: string) => ['jobs', 'public', page, search] as const,
  publicJob:        (id: string)   => ['job', 'public', id] as const,
  applications:     (jobId: string) => ['applications', jobId] as const,
  applicationCheck: (jobId: string) => ['application', 'check', jobId] as const,
  candidateProfile: () => ['candidate', 'profile'] as const,
  candidateApplications: () => ['candidate', 'applications'] as const,
  recruiterAnalytics:    () => ['analytics', 'recruiter'] as const,
  candidateAnalytics:    () => ['analytics', 'candidate'] as const,
};
