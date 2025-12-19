'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Briefcase, Building, Sparkles, ArrowRight, Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  // States
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'recruiter' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 1. Guard clause: stop if Clerk isn't loaded or user isn't logged in
    if (!isLoaded || !user) return

    // 2. Stop the check if we are currently in the middle of selecting or redirecting
    if (selecting || isRedirecting) return

    const userId = user.id;

    async function checkUserExists() {
      try {
        const { data, error: sbError } = await supabase
          .from('users')
          .select('role')
          .eq('clerk_id', userId)
          .maybeSingle() // Use maybeSingle to avoid errors if 0 rows found

        if (sbError) {
          console.error('Error checking user in Supabase:', sbError)
          setLoading(false)
          return
        }

        if (data?.role) {
          console.log('User already has role, redirecting to dashboard:', data.role)
          setIsRedirecting(true)
          // Use window.location for a hard redirect to avoid cache issues
          window.location.href = `/dashboard/${data.role}`
          return
        }

        // If no role found, stop the loading spinner so they see the cards
        setLoading(false)
      } catch (err) {
        console.error('Error checking user:', err)
        setLoading(false)
      }
    }

    checkUserExists()
  }, [user, isLoaded, selecting, isRedirecting])

  const handleRoleSelection = async (role: 'candidate' | 'recruiter') => {
    if (!user) {
      setError('User not found. Please sign in again.')
      return
    }

    const email = user.primaryEmailAddress?.emailAddress
    if (!email) {
      setError('Email address not found. Please update your profile.')
      return
    }

    setSelecting(true)
    setSelectedRole(role)
    setError(null)

    try {
      console.log('Onboarding: Sending role selection to API', { email, role })
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Onboarding: API error', data)
        throw new Error(data.error || data.details || 'Failed to save user data')
      }

      console.log('Onboarding: User saved successfully, redirecting to dashboard', { role })
      
      // Final Step: Lock the UI and redirect
      setIsRedirecting(true)

      /**
       * IMPORTANT: Using window.location.href instead of router.replace
       * helps break the Next.js App Router cache and ensures the Dashboard 
       * sees the fresh Supabase data.
       */
      // Small delay to ensure state is updated and UI shows loading
      setTimeout(() => {
        window.location.href = `/dashboard/${role}`
      }, 100)

    } catch (err) {
      console.error('Onboarding: Error in handleRoleSelection', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSelecting(false)
      setSelectedRole(null)
      setIsRedirecting(false)
    }
  }

  // Loading Screen (Initial check or Redirecting state)
  if (!isLoaded || loading || isRedirecting) {
    return (
      <div className="relative min-h-screen bg-white flex items-center justify-center">
        <div className="text-center z-10">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-medium">
            {isRedirecting ? 'Preparing your dashboard...' : 'Loading profile...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-screen pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
        <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] bg-slate-50 rounded-full blur-[120px] opacity-60"></div>
      </div>

      <div className="w-full max-w-4xl z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-600 text-xs font-semibold uppercase tracking-wide mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-500 fill-blue-100" />
            <span>Get Started</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-4 leading-tight">
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-400 italic">
              Smart Hire
            </span>
          </h1>

          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Choose your role to begin your journey with AI-powered recruitment
          </p>
        </div>

        {error && (
          <div className="mb-6 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800 text-sm font-medium text-center">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Candidate Card */}
          <button
            onClick={() => handleRoleSelection('candidate')}
            disabled={selecting}
            className={`group relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-50 ${selectedRole === 'candidate' ? 'border-blue-600 scale-[0.98]' : 'border-slate-200 hover:border-blue-300'
              }`}
          >
            <div className="relative z-10 text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">I am a Candidate</h3>
              <p className="text-slate-600 mb-6">Looking for opportunities? Let AI match you with the perfect roles.</p>
              <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                {selecting && selectedRole === 'candidate' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <><span>Get Started</span><ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </div>
            </div>
          </button>

          {/* Recruiter Card */}
          <button
            onClick={() => handleRoleSelection('recruiter')}
            disabled={selecting}
            className={`group relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-50 ${selectedRole === 'recruiter' ? 'border-blue-600 scale-[0.98]' : 'border-slate-200 hover:border-blue-300'
              }`}
          >
            <div className="relative z-10 text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                  <Building className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">I am a Recruiter</h3>
              <p className="text-slate-600 mb-6">Hiring talent? Streamline your process with AI-powered screening.</p>
              <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                {selecting && selectedRole === 'recruiter' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <><span>Get Started</span><ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}