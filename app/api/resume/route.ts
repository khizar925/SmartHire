import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const path = searchParams.get('path');

        if (!path) {
            return NextResponse.json({ error: 'path is required' }, { status: 400 });
        }

        // Verify ownership: caller must be the candidate who owns this resume,
        // or the recruiter who owns the job it was submitted to.
        const { data: appData, error: appError } = await supabase
            .from('applications')
            .select('candidate_id, jobs(recruiter_id)')
            .eq('resume_url', path)
            .single();

        if (appError || !appData) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // @ts-ignore — nested join
        const recruiterOwns = appData.jobs?.recruiter_id === userId;
        const candidateOwns = appData.candidate_id === userId;

        if (!recruiterOwns && !candidateOwns) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Generate a signed URL valid for 1 hour
        const { data, error } = await supabase.storage
            .from('resumes')
            .createSignedUrl(path, 3600);

        if (error || !data?.signedUrl) {
            console.error('Signed URL error:', error);
            return NextResponse.json({ error: 'Failed to generate resume URL' }, { status: 500 });
        }

        return NextResponse.redirect(data.signedUrl);
    } catch (error) {
        console.error('Resume URL error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
