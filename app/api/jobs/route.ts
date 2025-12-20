// app/api/jobs/route.ts
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { JobPostingFormData } from '@/types'

// Validate LinkedIn URL format
function isValidLinkedInUrl(url: string): boolean {
  const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\/(company|in|pub)\/.+/
  return linkedInPattern.test(url)
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database to verify role
    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .select('id, role')
      .eq('clerk_id', userId)
      .maybeSingle()

    if (userError || !userData) {
      console.error('API /jobs POST: Error fetching user', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (userData.role !== 'recruiter') {
      return NextResponse.json({ error: 'Only recruiters can post jobs' }, { status: 403 })
    }

    const body: JobPostingFormData = await request.json()

    // Validate required fields
    const requiredFields = [
      'job_title',
      'company_name',
      'workplace_type',
      'job_location',
      'employment_type',
      'job_description',
      'skills',
      'industry',
      'job_function',
    ]

    for (const field of requiredFields) {
      if (!body[field as keyof JobPostingFormData]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate workplace_type
    if (!['On-site', 'Hybrid', 'Remote'].includes(body.workplace_type)) {
      return NextResponse.json(
        { error: 'Invalid workplace_type. Must be On-site, Hybrid, or Remote' },
        { status: 400 }
      )
    }

    // Validate skills array
    if (!Array.isArray(body.skills) || body.skills.length === 0) {
      return NextResponse.json(
        { error: 'Skills must be a non-empty array' },
        { status: 400 }
      )
    }

    // Validate LinkedIn URL if provided
    if (body.company_linkedin_url && !isValidLinkedInUrl(body.company_linkedin_url)) {
      return NextResponse.json(
        { error: 'Invalid LinkedIn URL format' },
        { status: 400 }
      )
    }

    // Validate salary range if provided
    if (body.salary_min !== undefined && body.salary_max !== undefined) {
      if (body.salary_min > body.salary_max) {
        return NextResponse.json(
          { error: 'Salary minimum cannot be greater than maximum' },
          { status: 400 }
        )
      }
    }

    // Calculate expiry_date: if provided, use it; otherwise default to 30 days from now
    let expiryDate: string | null = null
    if (body.expiry_date) {
      expiryDate = new Date(body.expiry_date).toISOString()
    } else {
      // Default to 30 days from now
      const defaultExpiry = new Date()
      defaultExpiry.setDate(defaultExpiry.getDate() + 30)
      expiryDate = defaultExpiry.toISOString()
    }

    // Insert job into database
    const jobData = {
      recruiter_id: userData.id,
      job_title: body.job_title,
      company_name: body.company_name,
      company_linkedin_url: body.company_linkedin_url || null,
      workplace_type: body.workplace_type,
      job_location: body.job_location,
      employment_type: body.employment_type,
      job_description: body.job_description,
      skills: body.skills,
      industry: body.industry,
      job_function: body.job_function,
      salary_min: body.salary_min || null,
      salary_max: body.salary_max || null,
      salary_currency: body.salary_currency || 'USD',
      expiry_date: expiryDate,
      status: 'active',
    }

    const { data, error } = await supabaseServer
      .from('jobs')
      .insert(jobData)
      .select()
      .single()

    if (error) {
      console.error('API /jobs POST: Supabase error', error)
      return NextResponse.json(
        { error: 'Failed to create job', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, job: data }, { status: 201 })
  } catch (error) {
    console.error('API /jobs POST: Unexpected error', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all active jobs ordered by most recent first
    const { data, error } = await supabaseServer
      .from('jobs')
      .select(`
        *,
        recruiter:users!jobs_recruiter_id_fkey (
          id,
          email,
          role
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('API /jobs GET: Supabase error', error)
      return NextResponse.json(
        { error: 'Failed to fetch jobs', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, jobs: data || [] }, { status: 200 })
  } catch (error) {
    console.error('API /jobs GET: Unexpected error', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
