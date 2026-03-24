import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/fetch';
import { queryKeys } from '@/lib/query-keys';

interface CandidateApplicationJob {
  job_title: string;
  company_name: string;
  job_location: string;
  employment_type: string;
  status: string;
}

export interface CandidateApplication {
  id: string;
  status: string;
  rejection_feedback: string | null;
  created_at: string;
  resume_url: string;
  jobs: CandidateApplicationJob | null;
}

export interface CandidateProfile {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  education_level: string;
  years_of_experience: number;
}

export function useCandidateApplications() {
  return useQuery({
    queryKey: queryKeys.candidateApplications(),
    queryFn: () =>
      apiFetch<{ applications: CandidateApplication[] }>('/api/candidate/applications').then(
        d => d.applications
      ),
  });
}

export function useCandidateProfile(userId?: string | null) {
  return useQuery({
    queryKey: queryKeys.candidateProfile(),
    queryFn: () => apiFetch<CandidateProfile | null>('/api/candidate/profile'),
    enabled: !!userId,
    staleTime: 15 * 60 * 1000,
  });
}
