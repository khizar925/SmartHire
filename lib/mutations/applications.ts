import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/fetch';
import { queryKeys } from '@/lib/query-keys';
import type { Application } from '@/lib/queries/applications';

export function useSubmitApplication(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiFetch('/api/application', { method: 'POST', body: formData }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.applicationCheck(jobId) });
      qc.invalidateQueries({ queryKey: queryKeys.candidateApplications() });
    },
  });
}

export function useUpdateApplicationStatus(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { applicationId: string; status: string; feedback?: string; interviewDate?: string; interviewTime?: string; interviewType?: string; interviewLink?: string }) =>
      apiFetch('/api/application', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: queryKeys.applications(jobId) });
      const prev = qc.getQueryData<Application[]>(queryKeys.applications(jobId));
      qc.setQueryData(queryKeys.applications(jobId), (old: Application[] | undefined) =>
        old?.map(app =>
          app.id === payload.applicationId
            ? { ...app, status: payload.status, rejection_feedback: payload.feedback, interview_date: payload.interviewDate, interview_time: payload.interviewTime, interview_type: payload.interviewType, interview_link: payload.interviewLink }
            : app
        )
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(queryKeys.applications(jobId), ctx?.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.applications(jobId) }),
  });
}
