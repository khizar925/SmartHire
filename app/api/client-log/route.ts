import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Max size of a single client error report; anything larger is dropped.
const MAX_BYTES = 8 * 1024; // 8 KB

// Receives client-side error reports and writes them to the server console,
// which surfaces them in Vercel logs. Requires a signed-in user so the endpoint
// can't be spammed anonymously. Never 500s.
export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const raw = await request.text();
        if (raw.length > MAX_BYTES) {
            console.error('[client-log] oversized report dropped', { userId, bytes: raw.length });
            return NextResponse.json({ ok: true });
        }

        let body: unknown;
        try {
            body = JSON.parse(raw);
        } catch {
            body = { raw: raw.slice(0, 500) };
        }
        console.error('[client-log]', userId, JSON.stringify(body));
    } catch (err) {
        console.error('[client-log] failed to read report', err);
    }
    return NextResponse.json({ ok: true });
}
