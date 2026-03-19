import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/fetch';
import { queryKeys } from '@/lib/query-keys';

interface CreateJobPayload {
  jobTitle: string;
  companyName: string;
  jobLocation: string;
  employmentType: string;
  jobDescription: string;
}

interface UpdateJobPayload {
  id: string;
  job_title: string;
  company_name: string;
  job_location: string;
  employment_type: string;
  job_description: string;
  skills: string;
  experience_level: string;
  status?: string;
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/jobs?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.jobs() }),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateJobPayload) =>
      apiFetch(`/api/jobs?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.jobs() }),
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateJobPayload) =>
      apiFetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.jobs() }),
  });
}
