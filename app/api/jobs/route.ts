// app/api/jobs/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { job_title, company_name, job_location, employment_type, job_description } = body;

    // Validate required fields
    const errors: string[] = [];
    if (!job_title || job_title.trim() === '') {
      errors.push('Job title is required');
    }
    if (!company_name || company_name.trim() === '') {
      errors.push('Company name is required');
    }
    if (!job_location || job_location.trim() === '') {
      errors.push('Job location is required');
    }
    if (!employment_type || employment_type.trim() === '') {
      errors.push('Employment type is required');
    }
    if (!job_description || job_description.trim() === '') {
      errors.push('Job description is required');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Failed to create job', details: errors },
        { status: 400 }
      );
    }

    // Insert job into Supabase
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        recruiter_id: userId,
        job_title: job_title.trim(),
        company_name: company_name.trim(),
        job_location: job_location.trim(),
        employment_type: employment_type.trim(),
        job_description: job_description.trim(),
        status: 'active',
        applicants_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating job:', error);
      return NextResponse.json(
        { error: 'Failed to create job', details: [error.message] },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Failed to create job', details: ['Database error occurred'] },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { job: data, message: 'Job created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job', details: ['An unexpected error occurred'] },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    // Fetch jobs for the current recruiter, ordered by created_at DESC
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('recruiter_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to load jobs', details: [error.message] },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { jobs: data || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to load jobs', details: ['An unexpected error occurred'] },
      { status: 500 }
    );
  }
}

