// app/api/jobs/my-jobs/route.ts
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
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
      console.error('API /jobs/my-jobs GET: Error fetching user', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (userData.role !== 'recruiter') {
      return NextResponse.json({ error: 'Only recruiters can view their jobs' }, { status: 403 })
    }

    // Get optional status filter from query params
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')

    // Build query
    let query = supabaseServer
      .from('jobs')
      .select('*')
      .eq('recruiter_id', userData.id)
      .order('created_at', { ascending: false })

    // Apply status filter if provided
    if (statusFilter && (statusFilter === 'active' || statusFilter === 'closed')) {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('API /jobs/my-jobs GET: Supabase error', error)
      return NextResponse.json(
        { error: 'Failed to fetch jobs', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, jobs: data || [] }, { status: 200 })
  } catch (error) {
    console.error('API /jobs/my-jobs GET: Unexpected error', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
