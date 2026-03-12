import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

// Polyfill for browser globals required by pdf-parse in Node environments
if (typeof global.DOMMatrix === 'undefined') {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix { constructor() { } };
}
if (typeof global.ImageData === 'undefined') {
    // @ts-ignore
    global.ImageData = class ImageData { constructor() { } };
}
if (typeof global.Path2D === 'undefined') {
    // @ts-ignore
    global.Path2D = class Path2D { constructor() { } };
}

const pdfMod = require('pdf-parse');
import mammoth from 'mammoth';

// Supports pdf-parse v1.x (exports a function) and v2.x (exports a class-based module)
async function parsePdfBuffer(buffer: Buffer): Promise<string> {
    // v1.x: the module itself is the parse function
    if (typeof pdfMod === 'function') {
        const data = await pdfMod(buffer);
        return data.text;
    }
    // v1.x (esm interop): default export is the function
    if (pdfMod?.default && typeof pdfMod.default === 'function') {
        const data = await pdfMod.default(buffer);
        return data.text;
    }
    // v2.x: exports a PDFParse class; buffer is passed via options.data, text via .getText()
    if (pdfMod?.PDFParse) {
        const parser = new pdfMod.PDFParse({ data: new Uint8Array(buffer) });
        const result = await parser.getText();
        return result.text;
    }
    throw new Error('pdf-parse: no compatible API found in the installed version');
}

async function extractTextFromFile(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.name.split('.').pop()?.toLowerCase();

    try {
        if (fileType === 'pdf') {
            return await parsePdfBuffer(buffer);
        } else if (fileType === 'docx') {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } else if (fileType === 'doc') {
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

        // 4. Auto-score the resume immediately (best-effort — does not block submission on failure)
        try {
            const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, ''); // strip trailing slash
            const apiKey = process.env.API_KEY;

            if (backendUrl && apiKey) {
                const { data: jobScoreData } = await supabase
                    .from('jobs')
                    .select('job_description')
                    .eq('id', jobId)
                    .single();

                if (jobScoreData?.job_description) {
                    const controller = new AbortController();
                    const scoringTimeout = setTimeout(() => controller.abort(), 30000);

                    const scoreRes = await fetch(`${backendUrl}/score-single`, {
                        method: 'POST',
                        headers: {
                            'X-API-Key': apiKey,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            resume_text: resumeText ?? '',
                            job_description: jobScoreData.job_description,
                        }),
                        signal: controller.signal,
                    });

                    clearTimeout(scoringTimeout);

                    if (scoreRes.ok) {
                        const { score } = await scoreRes.json();
                        const now = new Date().toISOString();
                        await supabase.from('scores').upsert(
                            [{ job_id: jobId, application_id: applicationData.id, score, scored_at: now }],
                            { onConflict: 'job_id,application_id' }
                        );
                    } else {
                        console.error('Auto-scoring backend error:', await scoreRes.text());
                    }
                }
            }
        } catch (scoringError) {
            // Non-fatal: application was saved successfully; score can be added later
            console.error('Auto-scoring error (non-fatal):', scoringError);
        }

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
