import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('applications')
            .select(`
                id,
                status,
                rejection_feedback,
                created_at,
                resume_url,
                jobs (
                    job_title,
                    company_name,
                    job_location,
                    employment_type,
                    status
                ),
                scores (
                    score
                )
            `)
            .eq('candidate_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching candidate applications:', error);
            return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
        }

        return NextResponse.json({ applications: data || [] });
    } catch (error) {
        console.error('Unexpected error in candidate applications GET:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
