import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const search         = searchParams.get('search')?.trim() || '';
    const employmentType = searchParams.get('employment_type')?.trim() || '';
    const experienceLevel = searchParams.get('experience_level')?.trim() || '';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build the search filter string once
    const searchFilter = search
      ? `job_title.ilike.%${search}%,company_name.ilike.%${search}%,job_location.ilike.%${search}%`
      : null;

    // First, get total count
    let countQuery = supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    if (searchFilter)    countQuery = countQuery.or(searchFilter);
    if (employmentType)  countQuery = countQuery.eq('employment_type', employmentType);
    if (experienceLevel) countQuery = countQuery.eq('experience_level', experienceLevel);

    const { count, error: countError } = await countQuery;

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
    let dataQuery = supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (searchFilter)    dataQuery = dataQuery.or(searchFilter);
    if (employmentType)  dataQuery = dataQuery.eq('employment_type', employmentType);
    if (experienceLevel) dataQuery = dataQuery.eq('experience_level', experienceLevel);

    const { data, error } = await dataQuery;

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
        search,
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

