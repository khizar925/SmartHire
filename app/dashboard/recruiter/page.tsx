'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Building, Users, Briefcase, TrendingUp, Plus, Bell, Settings, User, Search, Filter } from 'lucide-react'

export default function RecruiterDashboard() {
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

        console.log('Dashboard recruiter: Checking user via API', { userId: user.id, retryCount })

        // Use API route to check user (bypasses RLS issues)
        const response = await fetch('/api/users/check')
        const result = await response.json()

        if (!response.ok) {
          console.error('Dashboard recruiter: API error', result)
          // Retry once on API errors
          if (retryCount < 1) {
            console.log('Dashboard recruiter: Retrying API call...', retryCount + 1)
            return checkUser(retryCount + 1)
          }
          setLoading(false)
          return
        }

        if (!result.exists || !result.role) {
          // Retry once if data not found (might be timing issue)
          if (retryCount < 1) {
            console.log('Dashboard recruiter: User not found, retrying...', retryCount + 1)
            return checkUser(retryCount + 1)
          }
          
          console.log('Dashboard recruiter: User not found after retries, redirecting to onboarding')
          router.push('/onboarding')
          return
        }

        // Verify user is a recruiter
        if (result.role !== 'recruiter') {
          console.log('Dashboard recruiter: User role mismatch, redirecting to', result.role)
          router.push(`/dashboard/${result.role}`)
          return
        }

        console.log('Dashboard recruiter: User verified, showing dashboard')
        setUserRole(result.role)
        setLoading(false)
      } catch (err) {
        console.error('Dashboard recruiter: Error checking user', err)
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
          <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] bg-green-50 rounded-full blur-[120px] opacity-60"></div>
        </div>
        <div className="text-center z-10">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <Building className="h-6 w-6 text-white" />
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
                <span className="text-sm font-medium text-slate-900">{user?.firstName || 'Recruiter'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {user?.firstName || 'Recruiter'}! 👋
            </h2>
            <p className="text-slate-600 text-lg">
              Manage your hiring pipeline with AI-powered insights
            </p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Post New Job
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900">8</span>
            </div>
            <p className="text-slate-600 font-medium">Active Jobs</p>
            <p className="text-sm text-slate-500 mt-1">3 closing soon</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900">142</span>
            </div>
            <p className="text-slate-600 font-medium">Total Candidates</p>
            <p className="text-sm text-slate-500 mt-1">24 new this week</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900">68%</span>
            </div>
            <p className="text-slate-600 font-medium">Fill Rate</p>
            <p className="text-sm text-slate-500 mt-1">+5% this month</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Search className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900">32</span>
            </div>
            <p className="text-slate-600 font-medium">Interviews</p>
            <p className="text-sm text-slate-500 mt-1">8 scheduled today</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Candidates */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Recent Candidates</h3>
              <button className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Sarah Johnson', role: 'Senior Developer', match: 94, status: 'Top Match' },
                { name: 'Michael Chen', role: 'UI/UX Designer', match: 89, status: 'Interview' },
                { name: 'Emily Rodriguez', role: 'Product Manager', match: 87, status: 'Reviewing' },
              ].map((candidate, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {candidate.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{candidate.name}</h4>
                        <p className="text-sm text-slate-600">{candidate.role}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      {candidate.match}% Match
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{candidate.status}</span>
                    <button className="text-xs text-primary-600 font-medium hover:text-primary-700">
                      View Profile →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Job Postings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Active Job Postings</h3>
              <button className="text-sm text-primary-600 font-medium hover:text-primary-700">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Senior Full Stack Engineer', applicants: 45, status: 'Active', days: 12 },
                { title: 'Product Designer', applicants: 28, status: 'Active', days: 8 },
                { title: 'DevOps Engineer', applicants: 19, status: 'Closing Soon', days: 2 },
              ].map((job, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">{job.title}</h4>
                      <p className="text-sm text-slate-600">{job.applicants} applicants</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      job.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{job.days} days remaining</span>
                    <button className="text-xs text-primary-600 font-medium hover:text-primary-700">
                      Manage →
                    </button>
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
            <button className="p-4 border-2 border-slate-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-center">
              <Plus className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-900">Post Job</p>
            </button>
            <button className="p-4 border-2 border-slate-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-center">
              <Search className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-900">Search Candidates</p>
            </button>
            <button className="p-4 border-2 border-slate-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-center">
              <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-900">View Pipeline</p>
            </button>
            <button className="p-4 border-2 border-slate-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-center">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-900">Analytics</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
