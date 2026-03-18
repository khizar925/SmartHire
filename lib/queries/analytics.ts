import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/fetch';
import { queryKeys } from '@/lib/query-keys';

export interface ApplicationsOverTimePoint {
  date: string;
  count: number;
}

export interface StatusBreakdownPoint {
  status: string;
  count: number;
}

export interface TopJobPoint {
  job_title: string;
  applicants_count: number;
}

export interface ScoreTrendPoint {
  job_title: string;
  score: number | null;
  applied_at: string;
}

export interface RecruiterAnalyticsData {
  applicationsOverTime: ApplicationsOverTimePoint[];
  statusBreakdown: StatusBreakdownPoint[];
  topJobs: TopJobPoint[];
  openPosts: number;
}

export interface CandidateAnalyticsData {
  statusSummary: StatusBreakdownPoint[];
  scoreTrend: ScoreTrendPoint[];
}

export function useRecruiterAnalytics() {
  return useQuery({
    queryKey: queryKeys.recruiterAnalytics(),
    queryFn: () => apiFetch<RecruiterAnalyticsData>('/api/analytics/recruiter'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCandidateAnalytics() {
  return useQuery({
    queryKey: queryKeys.candidateAnalytics(),
    queryFn: () => apiFetch<CandidateAnalyticsData>('/api/analytics/candidate'),
    staleTime: 5 * 60 * 1000,
  });
}
