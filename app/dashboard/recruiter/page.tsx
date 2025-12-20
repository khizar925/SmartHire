'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Building, Users, TrendingUp, Plus, Bell, Settings, Search, Briefcase, MapPin, Clock, Trash2, Calendar } from 'lucide-react'
import { JobPostingModal } from '@/components/JobPostingModal'
import { Job } from '@/types'

export default function RecruiterDashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null)

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

  // Fetch jobs when user role is verified
  useEffect(() => {
    if (userRole === 'recruiter') {
      fetchJobs()
    }
  }, [userRole])

  const fetchJobs = async () => {
    try {
      setJobsLoading(true)
      const response = await fetch('/api/jobs/my-jobs')
      const result = await response.json()

      if (response.ok && result.jobs) {
        setJobs(result.jobs)
      } else {
        console.error('Error fetching jobs:', result.error)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setJobsLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingJobId(jobId)
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (response.ok) {
        // Refresh jobs list
        await fetchJobs()
      } else {
        alert(result.error || 'Failed to delete job')
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Failed to delete job. Please try again.')
    } finally {
      setDeletingJobId(null)
    }
  }

  const getExpiryStatus = (expiryDate: string | null | undefined) => {
    if (!expiryDate) return { status: 'active', color: 'green', label: 'Active' }
    
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'red', label: 'Expired' }
    } else if (daysUntilExpiry <= 7) {
      return { status: 'expiring', color: 'orange', label: `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}` }
    } else {
      return { status: 'active', color: 'green', label: `Expires in ${daysUntilExpiry} days` }
    }
  }

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
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Post New Job
          </button>
        </div>

        {/* My Job Postings */}
        <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">My Job Postings</h3>
            <button
              onClick={fetchJobs}
              disabled={jobsLoading}
              className="text-sm text-primary-600 font-medium hover:text-primary-700 disabled:opacity-50"
            >
              {jobsLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {jobsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent mb-4"></div>
              <p className="text-slate-600">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 text-lg font-medium mb-2">No jobs posted yet</p>
              <p className="text-slate-500 text-sm mb-4">Get started by posting your first job</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
              >
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const expiryStatus = getExpiryStatus(job.expiry_date)
                const statusColors = {
                  expired: 'bg-red-100 text-red-700 border-red-200',
                  expiring: 'bg-orange-100 text-orange-700 border-orange-200',
                  active: 'bg-green-100 text-green-700 border-green-200',
                }

                return (
                  <div
                    key={job.id}
                    className="p-6 border border-slate-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                            <Briefcase className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-slate-900 mb-1">
                              {job.job_title}
                            </h4>
                            <p className="text-slate-600 font-medium mb-2">{job.company_name}</p>
                          </div>
                        </div>

                        {/* Job Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>{job.job_location}</span>
                            <span className="text-slate-400">•</span>
                            <span>{job.workplace_type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span>{job.employment_type}</span>
                          </div>
                        </div>

                        {/* Expiry Date */}
                        {job.expiry_date && (
                          <div className="flex items-center gap-2 mb-4">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              Expires: {new Date(job.expiry_date).toLocaleDateString()}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded border ${statusColors[expiryStatus.status as keyof typeof statusColors]}`}
                            >
                              {expiryStatus.label}
                            </span>
                          </div>
                        )}

                        {/* Skills */}
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills.slice(0, 5).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 5 && (
                              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                +{job.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <span className="text-xs text-slate-500">
                        Posted {new Date(job.created_at).toLocaleDateString()}
                        {job.status === 'closed' && (
                          <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                            Closed
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => handleDeleteJob(job.id, job.job_title)}
                        disabled={deletingJobId === job.id}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingJobId === job.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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

      {/* Job Posting Modal */}
      <JobPostingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false)
          // Refresh jobs list after posting
          fetchJobs()
        }}
      />
    </div>
  )
}
