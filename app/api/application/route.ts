import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();

        // Extract fields
        const jobId = formData.get('jobId') as string;
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phoneNumber') as string;
        const education = formData.get('educationLevel') as string;
        const experience = formData.get('yearsOfExperience') as string;
        const coverLetter = formData.get('coverLetter') as string;
        const resume = formData.get('resume') as File;

        if (!jobId || !resume) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Upload Resume to Storage
        const fileExt = resume.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${jobId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filePath, resume, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Storage error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload resume' }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('resumes')
            .getPublicUrl(filePath);

        // 2. Insert Application Record
        const { data: applicationData, error: dbError } = await supabase
            .from('applications')
            .insert({
                job_id: jobId,
                candidate_id: userId,
                full_name: name,
                email: email,
                phone: phone,
                education_level: education,
                years_of_experience: parseFloat(experience),
                cover_letter: coverLetter,
                resume_url: publicUrl,
                status: 'pending'
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({ error: 'Failed to save application' }, { status: 500 });
        }

        // 3. Increment applicant count for the job
        await supabase.rpc('increment_applicants_count', { row_id: jobId });
        // Fallback if RPC isn't available:
        /*
        const { data: jobData } = await supabase.from('jobs').select('applicants_count').eq('id', jobId).single();
        await supabase.from('jobs').update({ applicants_count: (jobData?.applicants_count || 0) + 1 }).eq('id', jobId);
        */

        return NextResponse.json({ success: true, application: applicationData });
    } catch (error) {
        console.error('Application submission error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        // Fetch applications for this job
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .eq('job_id', jobId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
        }

        return NextResponse.json({ applications: data });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
