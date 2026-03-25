import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/fetch';
import { queryKeys } from '@/lib/query-keys';

export interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  education_level: string;
  years_of_experience: number;
  cover_letter: string;
  resume_url: string;
  rejection_feedback?: string;
  interview_date?: string;
  interview_time?: string;
  interview_type?: string;
  interview_link?: string;
  status: string;
  created_at: string;
  scores?: { score: number }[];
}

export function useApplications(jobId: string) {
  return useQuery({
    queryKey: queryKeys.applications(jobId),
    queryFn: () =>
      apiFetch<{ applications: Application[] }>(`/api/application?jobId=${jobId}`).then(
        d => d.applications
      ),
    enabled: !!jobId,
  });
}

export function useApplicationCheck(jobId: string, userId?: string | null) {
  return useQuery({
    queryKey: queryKeys.applicationCheck(jobId),
    queryFn: () =>
      apiFetch<{ hasApplied: boolean; application?: { status: string } }>(
        `/api/application?jobId=${jobId}&check=true`
      ),
    enabled: !!jobId && !!userId,
  });
}
