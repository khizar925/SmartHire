import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

// Polyfill for browser globals required by pdf-parse in Node environments
if (typeof global.DOMMatrix === 'undefined') {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        constructor() { }
    };
}
if (typeof global.ImageData === 'undefined') {
    // @ts-ignore
    global.ImageData = class ImageData {
        constructor() { }
    };
}
if (typeof global.Path2D === 'undefined') {
    // @ts-ignore
    global.Path2D = class Path2D {
        constructor() { }
    };
}

const pdf = require('pdf-parse');
// Handle different module formats (CommonJS vs ESM)
const getPdfParser = (mod: any) => {
    if (typeof mod === 'function') return mod;
    if (mod && typeof mod.default === 'function') return mod.default;
    return mod;
};
const pdfParser = getPdfParser(pdf);
import mammoth from 'mammoth';

async function extractTextFromFile(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.name.split('.').pop()?.toLowerCase();

    try {
        if (fileType === 'pdf') {
            if (typeof pdfParser !== 'function') {
                console.error('pdfParser is not a function. Type:', typeof pdfParser, 'pdf object:', pdf);
                throw new Error('PDF parser initialization failed');
            }
            const data = await pdfParser(buffer);
            return data.text;
        } else if (fileType === 'docx') {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } else if (fileType === 'doc') {
            // Basic support for .doc might be limited with mammoth, 
            // but we can try to extract what we can or advise users to use .docx
            return "Legacy .doc format detected. Automated extraction limited.";
        } else if (fileType === 'txt') {
            return buffer.toString('utf-8');
        }
    } catch (error) {
        console.error('Extraction error:', error);
        return "";
    }
    return "";
}

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

        // BR-02: Single Application Policy
        const { data: existingApp, error: checkError } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', jobId)
            .eq('candidate_id', userId)
            .maybeSingle();

        if (checkError) {
            console.error('Check error:', checkError);
        }

        if (existingApp) {
            return NextResponse.json({ error: 'You have already applied for this job' }, { status: 400 });
        }

        // 0. Extract Text from Resume
        const resumeText = await extractTextFromFile(resume);

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
                resume_text: resumeText,
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
        const check = searchParams.get('check') === 'true';

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        if (check) {
            const { data, error } = await supabase
                .from('applications')
                .select('id, status')
                .eq('job_id', jobId)
                .eq('candidate_id', userId)
                .maybeSingle();

            if (error) {
                console.error('Check error:', error);
                return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
            }

            return NextResponse.json({ hasApplied: !!data, application: data });
        }

        // Fetch applications for this job (Recruiter view)
        const { data, error } = await supabase
            .from('applications')
            .select('*, scores(score)')
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
export async function PATCH(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { applicationId, status, feedback } = body;

        if (!applicationId || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Verify that the current user is the recruiter for the job this application belongs to
        const { data: appData, error: appError } = await supabase
            .from('applications')
            .select('job_id, jobs(recruiter_id)')
            .eq('id', applicationId)
            .single();

        if (appError || !appData) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // @ts-ignore - nested join type issues
        if (appData.jobs.recruiter_id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Perform the update
        const updateData: any = { status };
        if (status === 'rejected' && feedback) {
            updateData.rejection_feedback = feedback;
        }

        const { data, error } = await supabase
            .from('applications')
            .update(updateData)
            .eq('id', applicationId)
            .select()
            .single();

        if (error) {
            console.error('Update error:', error);
            return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
        }

        return NextResponse.json({ success: true, application: data });
    } catch (error) {
        console.error('Application update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
