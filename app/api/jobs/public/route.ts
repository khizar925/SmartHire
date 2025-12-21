import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    // Optional authentication - doesn't require auth but uses it if available
    const { userId } = await auth();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

    // Calculate offset
    const offset = (page - 1) * limit;

    // First, get total count of active jobs
    const { count, error: countError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (countError) {
      console.error('Supabase error counting jobs:', countError);
      return NextResponse.json(
        { error: 'Failed to load jobs', details: [countError.message] },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    // Fetch active jobs with pagination
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to load jobs', details: [error.message] },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        jobs: data || [],
        total,
        page,
        limit,
        totalPages,
        hasMore,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching public jobs:', error);
    return NextResponse.json(
      { error: 'Failed to load jobs', details: ['An unexpected error occurred'] },
      { status: 500 }
    );
  }
}

