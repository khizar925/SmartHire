// app/api/jobs/[id]/route.ts
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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
      console.error('API /jobs/[id] DELETE: Error fetching user', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (userData.role !== 'recruiter') {
      return NextResponse.json({ error: 'Only recruiters can delete jobs' }, { status: 403 })
    }

    // Handle both Promise and direct params (Next.js 15+ vs 14)
    const resolvedParams = params instanceof Promise ? await params : params
    const jobId = resolvedParams.id

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // First, verify the job belongs to this recruiter
    const { data: job, error: jobError } = await supabaseServer
      .from('jobs')
      .select('id, recruiter_id')
      .eq('id', jobId)
      .maybeSingle()

    if (jobError) {
      console.error('API /jobs/[id] DELETE: Error fetching job', jobError)
      return NextResponse.json(
        { error: 'Failed to fetch job', details: jobError.message },
        { status: 500 }
      )
    }

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.recruiter_id !== userData.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this job' },
        { status: 403 }
      )
    }

    // Delete the job (hard delete)
    const { error: deleteError } = await supabaseServer
      .from('jobs')
      .delete()
      .eq('id', jobId)

    if (deleteError) {
      console.error('API /jobs/[id] DELETE: Error deleting job', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete job', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Job deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('API /jobs/[id] DELETE: Unexpected error', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
