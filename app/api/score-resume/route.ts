import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase-server';

const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt'];

async function extractTextFromFile(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop()?.toLowerCase();

    try {
        if (ext === 'pdf') {
            const data = await pdfParse(buffer);
            return data.text;
        } else if (ext === 'docx') {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } else if (ext === 'txt') {
            return buffer.toString('utf-8');
        }
    } catch (error) {
        console.error('Text extraction error:', error);
    }
    return '';
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const resume = formData.get('resume') as File | null;
        const jobId = formData.get('jobId') as string | null;
        const customJd = formData.get('customJd') as string | null;

        if (!resume) {
            return NextResponse.json({ error: 'Missing resume' }, { status: 400 });
        }

        // Validate file size
        if (resume.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File exceeds 5 MB limit' }, { status: 400 });
        }

        // Validate file type
        const ext = resume.name.split('.').pop()?.toLowerCase();
        if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
            return NextResponse.json({ error: 'Invalid file type. Use PDF, DOCX, or TXT.' }, { status: 400 });
        }

        // Extract resume text
        const resumeText = await extractTextFromFile(resume);
        if (!resumeText.trim()) {
            return NextResponse.json({ error: 'Could not extract text from resume' }, { status: 400 });
        }

        // Resolve job description
        let jobDescription = '';
        if (jobId) {
            const { data: jobData, error: jobError } = await supabase
                .from('jobs')
                .select('job_description')
                .eq('id', jobId)
                .single();

            if (jobError || !jobData?.job_description) {
                return NextResponse.json({ error: 'Job not found' }, { status: 404 });
            }
            jobDescription = jobData.job_description;
        } else if (customJd?.trim()) {
            jobDescription = customJd.trim();
        }

        // Call FastAPI scorer
        const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, '');
        const apiKey = process.env.API_KEY;

        if (!backendUrl || !apiKey) {
            return NextResponse.json({ error: 'Scoring service not configured' }, { status: 503 });
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        let scoreRes: Response;
        try {
            scoreRes = await fetch(`${backendUrl}/score-single`, {
                method: 'POST',
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resume_text: resumeText,
                    job_description: jobDescription,
                }),
                signal: controller.signal,
            });
        } catch (err: any) {
            if (err?.name === 'AbortError') {
                return NextResponse.json({ error: 'Scoring service unavailable. Please try again later.' }, { status: 503 });
            }
            throw err;
        } finally {
            clearTimeout(timeout);
        }

        if (!scoreRes.ok) {
            console.error('FastAPI error:', await scoreRes.text());
            return NextResponse.json({ error: 'Scoring service error. Please try again later.' }, { status: 502 });
        }

        const { score } = await scoreRes.json();
        return NextResponse.json({ score });
    } catch (error) {
        console.error('Score resume error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
