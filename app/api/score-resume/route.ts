import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase-server';

const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
]);

type MagicResult = 'pdf' | 'docx' | 'doc' | 'txt' | 'unknown';

function detectMagicBytes(buf: Buffer): MagicResult {
    if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return 'pdf';
    if (buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x03 && buf[3] === 0x04) return 'docx';
    if (buf[0] === 0xD0 && buf[1] === 0xCF && buf[2] === 0x11 && buf[3] === 0xE0) return 'doc';
    try {
        const sample = buf.slice(0, 512).toString('utf-8');
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

async function extractTextFromFile(file: File, buffer: Buffer): Promise<string> {
    const detected = detectMagicBytes(buffer);

    try {
        if (detected === 'pdf') {
            const data = await pdfParse(buffer);
            return data.text;
        } else if (detected === 'docx') {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } else if (detected === 'doc') {
            return 'Legacy .doc format detected. Automated extraction limited.';
        } else if (detected === 'txt') {
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

        // Validate file (size, MIME type, magic bytes)
        const resumeBuffer = Buffer.from(await resume.arrayBuffer());
        const fileValidationError = validateFile(resume, resumeBuffer);
        if (fileValidationError) {
            return NextResponse.json({ error: fileValidationError }, { status: 400 });
        }

        // Extract resume text
        const resumeText = await extractTextFromFile(resume, resumeBuffer);
        if (!resumeText.trim()) {
            return NextResponse.json({ error: 'Could not extract text from resume' }, { status: 400 });
        }

        if (customJd && customJd.length > 10000) {
            return NextResponse.json({ error: 'Job description must be 10,000 characters or fewer' }, { status: 400 });
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
