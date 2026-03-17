import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/fetch';
import { queryKeys } from '@/lib/query-keys';

export interface CandidateProfile {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  education_level: string;
  years_of_experience: number;
}

export function useCandidateProfile(userId?: string | null) {
  return useQuery({
    queryKey: queryKeys.candidateProfile(),
    queryFn: () => apiFetch<CandidateProfile | null>('/api/candidate/profile'),
    enabled: !!userId,
    staleTime: 15 * 60 * 1000,
  });
}
