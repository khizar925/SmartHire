'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Briefcase, Search, FileText, TrendingUp, Bell, Settings, User, LogOut } from 'lucide-react'

export default function CandidateDashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    async function checkUser(retryCount = 0) {
      if (!isLoaded) return

      if (!user) {
        router.push('/signin')
        return
      }

      try {
        // Add a small delay to ensure data is committed after redirect
        // Increase delay on retries
        await new Promise(resolve => setTimeout(resolve, 500 + (retryCount * 500)))

        console.log('Dashboard candidate: Checking user via API', { userId: user.id, retryCount })

        // Use API route to check user (bypasses RLS issues)
        const response = await fetch('/api/users/check')
        const result = await response.json()

        if (!response.ok) {
          console.error('Dashboard candidate: API error', result)
          // Retry once on API errors
          if (retryCount < 1) {
            console.log('Dashboard candidate: Retrying API call...', retryCount + 1)
            return checkUser(retryCount + 1)
          }
          setLoading(false)
          return
        }

        if (!result.exists || !result.role) {
          // Retry once if data not found (might be timing issue)
          if (retryCount < 1) {
            console.log('Dashboard candidate: User not found, retrying...', retryCount + 1)
            return checkUser(retryCount + 1)
          }
          
          console.log('Dashboard candidate: User not found after retries, redirecting to onboarding')
          router.push('/onboarding')
          return
        }

        // Verify user is a candidate
        if (result.role !== 'candidate') {
          console.log('Dashboard candidate: User role mismatch, redirecting to', result.role)
          router.push(`/dashboard/${result.role}`)
          return
        }

        console.log('Dashboard candidate: User verified, showing dashboard')
        setUserRole(result.role)
        setLoading(false)
      } catch (err) {
        console.error('Dashboard candidate: Error checking user', err)
        // Retry once on unexpected errors
        if (retryCount < 1) {
          return checkUser(retryCount + 1)
        }
        setLoading(false)
      }
    }

    checkUser()
  }, [user, isLoaded, router])

  if (!isLoaded || loading) {
    return (
      <div className="relative min-h-screen bg-white flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-screen pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-primary-100 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
          <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
        </div>
        <div className="text-center z-10">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Smart Hire</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                <UserButton />
                <span className="text-sm font-medium text-slate-900">{user?.firstName || 'Candidate'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.firstName || 'Candidate'}! 👋
          </h2>
          <p className="text-slate-600 text-lg">
            Your AI-powered job search dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900">12</span>
            </div>
            <p className="text-slate-600 font-medium">Applications</p>
            <p className="text-sm text-slate-500 mt-1">3 pending reviews</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900">85%</span>
            </div>
            <p className="text-slate-600 font-medium">Match Score</p>
            <p className="text-sm text-slate-500 mt-1">Above average</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900">24</span>
            </div>
            <p className="text-slate-600 font-medium">Job Matches</p>
            <p className="text-sm text-slate-500 mt-1">New this week</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommended Jobs */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Recommended Jobs</h3>
              <button className="text-sm text-primary-600 font-medium hover:text-primary-700">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Senior Software Engineer</h4>
                      <p className="text-sm text-slate-600 mb-2">Tech Corp Inc.</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Remote</span>
                        <span>•</span>
                        <span>$120k - $150k</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      92% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Application Status</h3>
              <button className="text-sm text-primary-600 font-medium hover:text-primary-700">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {[
                { company: 'Design Studio', role: 'UI/UX Designer', status: 'Under Review', bgColor: 'bg-blue-100', textColor: 'text-blue-700', barColor: 'bg-blue-500' },
                { company: 'StartupXYZ', role: 'Frontend Developer', status: 'Interview Scheduled', bgColor: 'bg-green-100', textColor: 'text-green-700', barColor: 'bg-green-500' },
                { company: 'BigTech Co', role: 'Full Stack Engineer', status: 'Application Sent', bgColor: 'bg-gray-100', textColor: 'text-gray-700', barColor: 'bg-gray-500' },
              ].map((app, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">{app.role}</h4>
                      <p className="text-sm text-slate-600">{app.company}</p>
                    </div>
                    <span className={`px-2 py-1 ${app.bgColor} ${app.textColor} text-xs font-medium rounded`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                    <div 
                      className={`${app.barColor} h-2 rounded-full`}
                      style={{ width: `${(idx + 1) * 30}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all text-center">
              <Search className="h-6 w-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-900">Search Jobs</p>
            </button>
            <button className="p-4 border-2 border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all text-center">
              <FileText className="h-6 w-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-900">Update Resume</p>
            </button>
            <button className="p-4 border-2 border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all text-center">
              <TrendingUp className="h-6 w-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-900">View Analytics</p>
            </button>
            <button className="p-4 border-2 border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all text-center">
              <Settings className="h-6 w-6 text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-900">Preferences</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
