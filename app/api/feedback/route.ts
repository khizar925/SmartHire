import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // Get role from Clerk metadata
    const { clerkClient } = await import('@clerk/nextjs/server');
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role as string | undefined;
    if (!role || (role !== 'candidate' && role !== 'recruiter')) {
        return NextResponse.json({ error: 'Role not set' }, { status: 403 });
    }

    let body: { rating?: number; category: string; message: string; page?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { rating, category, message, page } = body;

    if (!category || !message?.trim()) {
        return NextResponse.json({ error: 'category and message are required' }, { status: 400 });
    }

    const validCategories = ['Bug', 'Suggestion', 'Compliment', 'Other'];
    if (!validCategories.includes(category)) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
        return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const { error } = await supabase.from('feedback').insert({
        user_id: userId,
        role,
        rating: rating ?? null,
        category,
        message: message.trim(),
        page: page ?? null,
    });

    if (error) {
        console.error('[feedback] insert error:', error);
        return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
}
