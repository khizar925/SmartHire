// app/api/users/check/route.ts
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists and get their role
    const { data, error } = await supabaseServer
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .maybeSingle()

    if (error) {
      console.error('API /users/check: Supabase error', error)
      return NextResponse.json(
        { error: 'Failed to check user', details: error.message },
        { status: 500 }
      )
    }

    if (!data || !data.role) {
      return NextResponse.json(
        { exists: false },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { exists: true, role: data.role },
      { status: 200 }
    )
  } catch (error) {
    console.error('API /users/check: Unexpected error', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
