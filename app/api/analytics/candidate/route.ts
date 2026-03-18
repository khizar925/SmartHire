import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: applications, error } = await supabase
      .from('applications')
      .select('status, created_at, jobs ( job_title ), scores ( score )')
      .eq('candidate_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error fetching candidate analytics:', error);
      return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
    }

    const rows = applications ?? [];

    // --- status summary ---
    const statusMap = new Map<string, number>();
    for (const app of rows) {
      statusMap.set(app.status, (statusMap.get(app.status) ?? 0) + 1);
    }
    const statusSummary = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

    // --- score trend (one point per application, ordered by application date) ---
    const scoreTrend = rows.map((app) => ({
      job_title: ((app.jobs as unknown) as { job_title: string } | null)?.job_title ?? 'Unknown Job',
      score: ((app.scores as unknown) as { score: number }[] | null)?.[0]?.score ?? null,
      applied_at: app.created_at,
    }));

    return NextResponse.json({ statusSummary, scoreTrend });
  } catch (error) {
    console.error('Candidate analytics error:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
