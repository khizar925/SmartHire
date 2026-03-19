import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { applicationId } = await request.json();
        if (!applicationId) {
            return NextResponse.json({ error: 'applicationId is required' }, { status: 400 });
        }

        // Fetch application + job description, verify recruiter ownership
        const { data: app, error: appError } = await supabase
            .from('applications')
            .select('id, job_id, resume_text, jobs(recruiter_id, job_description)')
            .eq('id', applicationId)
            .single();

        if (appError || !app) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // @ts-ignore — nested join
        if (app.jobs.recruiter_id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // @ts-ignore — nested join
        const jobDescription: string = app.jobs.job_description;
        const resumeText: string = app.resume_text ?? '';

        if (!resumeText) {
            return NextResponse.json({ error: 'No resume text available to score' }, { status: 400 });
        }

        const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, '');
        const apiKey = process.env.API_KEY;

        if (!backendUrl || !apiKey) {
            return NextResponse.json({ error: 'Scoring service not configured' }, { status: 503 });
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const scoreRes = await fetch(`${backendUrl}/score-single`, {
            method: 'POST',
            headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!scoreRes.ok) {
            const text = await scoreRes.text();
            console.error('Scoring backend error:', text);
            return NextResponse.json({ error: 'Scoring service returned an error' }, { status: 502 });
        }

        const { score } = await scoreRes.json();
        const now = new Date().toISOString();

        await supabase.from('scores').upsert(
            [{ job_id: app.job_id, application_id: applicationId, score, scored_at: now }],
            { onConflict: 'job_id,application_id' }
        );

        return NextResponse.json({ success: true, score });
    } catch (error) {
        console.error('Retry score error:', error);
        return NextResponse.json({ error: 'Scoring service is unavailable' }, { status: 503 });
    }
}
