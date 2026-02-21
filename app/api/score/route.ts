import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { job_id } = body;

        if (!job_id) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        const backendUrl = process.env.backend_url;
        const apiKey = process.env.API_KEY;

        if (!backendUrl || !apiKey) {
            console.error('Backend configuration missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const response = await fetch(`${backendUrl}/score`, {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ job_id }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Backend scoring error:', data);
            return NextResponse.json({ error: data.error || 'Failed to score applications' }, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Scoring proxy error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
