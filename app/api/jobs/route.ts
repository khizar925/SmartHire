// app/api/jobs/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { JOB_EXPIRY_DAYS } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const authResult = await requireRole('recruiter');
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    const body = await request.json();
    const { job_title, company_name, job_location, employment_type, job_description, skills, experience_level, status } = body;

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
    } else if (job_description.length > 10000) {
      errors.push('Job description must be 10,000 characters or fewer');
    }

    // SRS Validation: Skills (Tags) - Minimum 3
    const skillList = skills ? skills.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '') : [];
    if (skillList.length < 3) {
      errors.push('At least 3 skills are required for semantic matching');
    }

    if (!experience_level || experience_level.trim() === '') {
      errors.push('Experience level is required');
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
        skills: skills.trim(),
        experience_level: experience_level.trim(),
        status: status === 'draft' ? 'draft' : 'active',
        applicants_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating job:', error);
      return NextResponse.json(
        { error: 'Failed to create job' },
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
    const authResult = await requireRole('recruiter');
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    // Fetch jobs for the current recruiter with real application counts
    const { data, error } = await supabase
      .from('jobs')
      .select('*, applications(count)')
      .eq('recruiter_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching jobs:', error);
      return NextResponse.json(
        { error: 'Failed to load jobs' },
        { status: 500 }
      );
    }

    // Map real application count into applicants_count (replaces stale stored counter)
    const jobs = (data || []).map(({ applications, ...job }) => ({
      ...job,
      applicants_count: (applications as Array<{ count: number }>)?.[0]?.count ?? 0,
    }));

    // Lazy auto-close: any active job older than JOB_EXPIRY_DAYS gets closed now
    const cutoff = new Date(Date.now() - JOB_EXPIRY_DAYS * 86_400_000).toISOString();
    const expiredIds = jobs
      .filter(j => j.status === 'active' && j.created_at < cutoff)
      .map(j => j.id);

    if (expiredIds.length > 0) {
      await supabase.from('jobs').update({ status: 'closed' }).in('id', expiredIds);
      jobs.forEach(j => {
        if (expiredIds.includes(j.id)) j.status = 'closed';
      });
    }

    return NextResponse.json(
      { jobs },
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

export async function PATCH(request: Request) {
  try {
    const authResult = await requireRole('recruiter');
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { job_title, company_name, job_location, employment_type, job_description, skills, experience_level, status } = body;

    const errors: string[] = [];
    if (!job_title?.trim())        errors.push('Job title is required');
    if (!company_name?.trim())     errors.push('Company name is required');
    if (!job_location?.trim())     errors.push('Job location is required');
    if (!employment_type?.trim())  errors.push('Employment type is required');
    if (!job_description?.trim())  errors.push('Job description is required');
    else if (job_description.length > 10000) errors.push('Job description must be 10,000 characters or fewer');
    if (!experience_level?.trim()) errors.push('Experience level is required');

    const skillList = skills ? skills.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '') : [];
    if (skillList.length < 3) errors.push('At least 3 skills are required');

    const ALLOWED_JOB_STATUSES = ['active', 'closed', 'draft'];
    if (status && !ALLOWED_JOB_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('jobs')
      .update({
        job_title: job_title.trim(),
        company_name: company_name.trim(),
        job_location: job_location.trim(),
        employment_type: employment_type.trim(),
        job_description: job_description.trim(),
        skills: skills.trim(),
        experience_level: experience_level.trim(),
        ...(status ? { status } : {}),
      })
      .eq('id', jobId)
      .eq('recruiter_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating job:', error);
      return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
    }

    return NextResponse.json({ job: data, message: 'Job updated successfully' });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authResult = await requireRole('recruiter');
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Verify ownership and delete
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)
      .eq('recruiter_id', userId);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

