import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import { format, subDays } from 'date-fns';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch recruiter's jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, job_title, applicants_count, status')
      .eq('recruiter_id', userId);

    if (jobsError) {
      console.error('Supabase error fetching jobs for analytics:', jobsError);
      return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
    }

    const jobIds = (jobs ?? []).map((j) => j.id);

    // Fetch all applications for those jobs
    const applications =
      jobIds.length > 0
        ? await supabase
            .from('applications')
            .select('status, created_at')
            .in('job_id', jobIds)
            .then(({ data, error }) => {
              if (error) throw error;
              return data ?? [];
            })
        : [];

    // --- applications over time (last 30 days) ---
    const dateMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      dateMap.set(format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'), 0);
    }
    for (const app of applications) {
      const d = format(new Date(app.created_at), 'yyyy-MM-dd');
      if (dateMap.has(d)) dateMap.set(d, (dateMap.get(d) ?? 0) + 1);
    }
    const applicationsOverTime = Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }));

    // --- status breakdown (all time) ---
    const statusMap = new Map<string, number>();
    for (const app of applications) {
      statusMap.set(app.status, (statusMap.get(app.status) ?? 0) + 1);
    }
    const statusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

    // --- top jobs by applicants (top 5) ---
    const topJobs = [...(jobs ?? [])]
      .sort((a, b) => b.applicants_count - a.applicants_count)
      .slice(0, 5)
      .map((j) => ({ job_title: j.job_title, applicants_count: j.applicants_count }));

    // --- open posts ---
    const openPosts = (jobs ?? []).filter((j) => j.status === 'active').length;

    return NextResponse.json({ applicationsOverTime, statusBreakdown, topJobs, openPosts });
  } catch (error) {
    console.error('Recruiter analytics error:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
