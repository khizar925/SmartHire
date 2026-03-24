import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import { sendStatusEmail } from '@/lib/email';
import { requireRole } from '@/lib/auth';

const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

// ── MIME / magic-byte validation ─────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

type MagicResult = 'pdf' | 'docx' | 'doc' | 'txt' | 'unknown';

function detectMagicBytes(buf: Buffer): MagicResult {
    // PDF: %PDF
    if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return 'pdf';
    // DOCX (ZIP): PK\x03\x04
    if (buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x03 && buf[3] === 0x04) return 'docx';
    // DOC (OLE2): D0 CF 11 E0
    if (buf[0] === 0xD0 && buf[1] === 0xCF && buf[2] === 0x11 && buf[3] === 0xE0) return 'doc';
    // TXT: valid UTF-8 with no binary content
    try {
        const sample = buf.slice(0, 512).toString('utf-8');
        // Reject if more than 10% non-printable characters
        const nonPrintable = (sample.match(/[\x00-\x08\x0E-\x1F\x7F]/g) || []).length;
        if (nonPrintable / sample.length < 0.1) return 'txt';
    } catch { /* fall through */ }
    return 'unknown';
}

function validateFile(file: File, buffer: Buffer): string | null {
    if (file.size > MAX_FILE_SIZE) {
        return 'File size exceeds the 5MB limit.';
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return `File type "${file.type}" is not allowed. Please upload a PDF, DOC, DOCX, or TXT file.`;
    }
    const detected = detectMagicBytes(buffer);
    if (detected === 'unknown') {
        return 'File content does not match a recognised format. Please upload a valid PDF, DOC, DOCX, or TXT file.';
    }
    return null;
}

// ── Text extraction ──────────────────────────────────────────────────────────

async function parsePdfBuffer(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return data.text;
}

async function extractTextFromFile(file: File, buffer: Buffer): Promise<string> {
    const detected = detectMagicBytes(buffer);

    try {
        if (detected === 'pdf') {
            return await parsePdfBuffer(buffer);
        } else if (detected === 'docx') {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } else if (detected === 'doc') {
            return 'Legacy .doc format detected. Automated extraction limited.';
        } else if (detected === 'txt') {
            return buffer.toString('utf-8');
        }
    } catch (error) {
        console.error('Extraction error:', error);
        return '';
    }
    return '';
}

export async function POST(request: Request) {
    try {
        const authResult = await requireRole('candidate');
        if (authResult instanceof NextResponse) return authResult;
        const { userId } = authResult;

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

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        const exp = parseFloat(experience);
        if (isNaN(exp) || exp < 0 || exp > 60) {
            return NextResponse.json({ error: 'Invalid years of experience' }, { status: 400 });
        }

        if (coverLetter && coverLetter.length > 5000) {
            return NextResponse.json({ error: 'Cover letter must be 5000 characters or fewer' }, { status: 400 });
        }

        // REQSAFE-03: MIME type + magic byte + size validation
        const resumeBuffer = Buffer.from(await resume.arrayBuffer());
        const fileValidationError = validateFile(resume, resumeBuffer);
        if (fileValidationError) {
            return NextResponse.json({ error: fileValidationError }, { status: 400 });
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

        // 0. Extract Text from Resume (buffer already read during validation)
        const resumeText = await extractTextFromFile(resume, resumeBuffer);

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

        // 2. Insert Application Record (store storage path, not public URL)
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
                resume_url: filePath,
                resume_text: resumeText,
                status: 'pending'
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            if (dbError.code === '23505') {
                return NextResponse.json({ error: 'You have already applied for this job' }, { status: 400 });
            }
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
            // Non-fatal: insert sentinel score of -1 so recruiter sees "Pending" with a retry button
            console.error('Auto-scoring error (non-fatal):', scoringError);
            try {
                const now = new Date().toISOString();
                await supabase.from('scores').upsert(
                    [{ job_id: jobId, application_id: applicationData.id, score: -1, scored_at: now }],
                    { onConflict: 'job_id,application_id' }
                );
            } catch (sentinelError) {
                console.error('Failed to insert pending sentinel score:', sentinelError);
            }
        }

        return NextResponse.json({ success: true, application: applicationData });
    } catch (error) {
        console.error('Application submission error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');
        const check = searchParams.get('check') === 'true';

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        // Candidate checking their own application status
        if (check) {
            const authResult = await requireRole('candidate');
            if (authResult instanceof NextResponse) return authResult;
            const { userId } = authResult;

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

        // Recruiter viewing applications for their job
        const recruiterAuth = await requireRole('recruiter');
        if (recruiterAuth instanceof NextResponse) return recruiterAuth;
        const { userId } = recruiterAuth;

        // Verify the authenticated user owns this job before returning applications
        const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('recruiter_id')
            .eq('id', jobId)
            .single();

        if (jobError || !jobData || jobData.recruiter_id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
        const authResult = await requireRole('recruiter');
        if (authResult instanceof NextResponse) return authResult;
        const { userId } = authResult;

        const body = await request.json();
        const { applicationId, status, feedback, interviewDate, interviewTime } = body;

        if (!applicationId || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const ALLOWED_STATUSES = ['pending', 'shortlisted', 'accepted', 'rejected'];
        if (!ALLOWED_STATUSES.includes(status)) {
            return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
        }

        // 1. Verify that the current user is the recruiter for the job this application belongs to
        const { data: appData, error: appError } = await supabase
            .from('applications')
            .select('job_id, full_name, email, jobs(recruiter_id, job_title, company_name)')
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
        if (status === 'shortlisted' && interviewDate && interviewTime) {
            updateData.interview_date = interviewDate;
            updateData.interview_time = interviewTime;
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

        // Send email notification to candidate on status change
        const notifyStatuses = ['accepted', 'rejected', 'shortlisted'];
        if (notifyStatuses.includes(status)) {
            try {
                await sendStatusEmail({
                    to: appData.email,
                    candidateName: appData.full_name,
                    // @ts-ignore - nested join type
                    jobTitle: appData.jobs.job_title,
                    // @ts-ignore - nested join type
                    companyName: appData.jobs.company_name,
                    status,
                    feedback: feedback ?? undefined,
                    interviewDate: interviewDate ?? undefined,
                    interviewTime: interviewTime ?? undefined,
                });
            } catch (emailError) {
                console.error('Failed to send status email:', emailError);
                // Non-fatal: status update succeeded, email failure should not block response
            }
        }

        return NextResponse.json({ success: true, application: data });
    } catch (error) {
        console.error('Application update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
