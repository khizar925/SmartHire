// app/api/users/route.ts
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      console.error('API /users POST: No userId from Clerk auth')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, role } = body

    if (!email || !role) {
      console.error('API /users POST: Missing email or role', { email: !!email, role: !!role })
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
    }

    // Validate role
    if (role !== 'candidate' && role !== 'recruiter') {
      console.error('API /users POST: Invalid role', { role })
      return NextResponse.json({ error: 'Role must be either candidate or recruiter' }, { status: 400 })
    }

    console.log('API /users POST: Attempting to upsert user', { userId, email, role })

    // Check if user already exists
    const { data: existingUser } = await supabaseServer
      .from('users')
      .select('clerk_id, created_at')
      .eq('clerk_id', userId)
      .maybeSingle()

    const now = new Date().toISOString()
    const userData: {
      clerk_id: string
      email: string
      role: string
      updated_at: string
      created_at?: string
    } = {
      clerk_id: userId,
      email,
      role,
      updated_at: now,
    }

    // Only set created_at if this is a new user
    if (!existingUser) {
      userData.created_at = now
      console.log('API /users POST: Creating new user')
    } else {
      console.log('API /users POST: Updating existing user')
    }

    // USE UPSERT: This updates the record if it exists, or creates it if it doesn't.
    const { data, error } = await supabaseServer
      .from('users')
      .upsert(userData, { onConflict: 'clerk_id' })
      .select()
      .single()

    if (error) {
      console.error('API /users POST: Supabase error', error)
      return NextResponse.json(
        { error: 'Failed to save user', details: error.message },
        { status: 500 }
      )
    }

    console.log('API /users POST: Successfully saved user', { userId, role })
    return NextResponse.json(
      { success: true, user: data },
      { status: 200 }
    )
  } catch (error) {
    console.error('API /users POST: Unexpected error', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}