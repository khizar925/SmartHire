import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { apiFetch } from '@/lib/fetch';
import { queryKeys } from '@/lib/query-keys';
import type { Job } from '@/types';

interface PaginatedJobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  search: string;
}

type JobData = {
  id: string;
  recruiter_id: string;
  job_title: string;
  job_location: string;
  employment_type: string;
  job_description: string;
  status: string;
  company_name: string;
};

export function useRecruiterJobs() {
  return useQuery({
    queryKey: queryKeys.jobs(),
    queryFn: () => apiFetch<{ jobs: Job[] }>('/api/jobs').then(d => d.jobs),
  });
}

export function usePublicJobs(page: number, search: string = '', employmentType: string = '', experienceLevel: string = '') {
  return useQuery({
    queryKey: queryKeys.publicJobs(page, search, employmentType, experienceLevel),
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (search)          params.set('search', search);
      if (employmentType)  params.set('employment_type', employmentType);
      if (experienceLevel) params.set('experience_level', experienceLevel);
      return apiFetch<PaginatedJobsResponse>(`/api/jobs/public?${params.toString()}`);
    },
    placeholderData: keepPreviousData,
  });
}

export function usePublicJob(id: string) {
  return useQuery({
    queryKey: queryKeys.publicJob(id),
    queryFn: () => apiFetch<JobData>(`/api/jobs/public/${id}`),
    enabled: !!id,
  });
}
