import { NextResponse } from 'next/server';

// Bulk scoring has been removed. Resumes are now scored automatically on submission.
export async function POST() {
    return NextResponse.json(
        { error: 'Bulk scoring has been removed. Resumes are scored automatically when a candidate applies.' },
        { status: 410 }
    );
}
