// app/auth/callback/route.ts
import { auth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    // If user is not authenticated, redirect to sign-in
    if (!userId) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }

    // Check if user exists in Supabase and get their role
    const { data, error } = await supabaseServer
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Auth callback: Supabase error', error)
      // On database error, redirect to onboarding as fallback
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // If user doesn't exist or has no role, redirect to onboarding
    if (!data || !data.role) {
      console.log('Auth callback: User not found or no role, redirecting to onboarding')
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Redirect based on role
    const role = data.role
    if (role === 'candidate') {
      console.log('Auth callback: Redirecting candidate to dashboard')
      return NextResponse.redirect(new URL('/dashboard/candidate', request.url))
    } else if (role === 'recruiter') {
      console.log('Auth callback: Redirecting recruiter to dashboard')
      return NextResponse.redirect(new URL('/dashboard/recruiter', request.url))
    } else {
      // Invalid role, redirect to onboarding
      console.log('Auth callback: Invalid role, redirecting to onboarding')
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  } catch (error) {
    console.error('Auth callback: Unexpected error', error)
    // On any unexpected error, redirect to onboarding as fallback
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }
}
