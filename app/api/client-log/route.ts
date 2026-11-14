import { NextResponse } from 'next/server';

// Receives client-side error reports and writes them to the server console,
// which surfaces them in Vercel logs. Intentionally unauthenticated and simple
// so it can capture failures that happen before/around auth. Never 500s.
export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        console.error('[client-log]', JSON.stringify(body));
    } catch (err) {
        console.error('[client-log] failed to read report', err);
    }
    return NextResponse.json({ ok: true });
}
