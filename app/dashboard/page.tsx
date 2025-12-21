import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Briefcase, Users } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import type { UserRole } from '@/types';

export default async function DashboardPage() {
  const user = await currentUser();

  // Redirect to sign-in if not authenticated
  if (!user) {
    redirect('/sign-in');
  }

  // Get role from user's public metadata
  const role = user.publicMetadata?.role as UserRole | undefined;

  // Redirect to onboarding if no role is set
  if (!role) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with UserButton */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 mb-2">
              Dashboard
            </h1>
            <p className="text-lg text-slate-600">
              Welcome back! Here's your overview.
            </p>
          </div>
          <div className="flex-shrink-0">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {/* Role-based Content */}
        {role === 'candidate' ? (
          <CandidateDashboard user={user} />
        ) : (
          <RecruiterDashboard user={user} />
        )}
      </div>
    </div>
  );
}

function CandidateDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-100 rounded-lg">
            <Users className="h-6 w-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Welcome, {user.firstName || 'Candidate'}!
            </h2>
            <p className="text-slate-600">
              You're viewing the candidate dashboard. Here you can track your job applications,
              view your profile, and discover new opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">My Applications</h3>
          <p className="text-sm text-slate-600">Track your job applications and their status</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Job Recommendations</h3>
          <p className="text-sm text-slate-600">Discover jobs matched to your profile</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Profile</h3>
          <p className="text-sm text-slate-600">Manage your candidate profile and preferences</p>
        </div>
      </div>
    </div>
  );
}

function RecruiterDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-100 rounded-lg">
            <Briefcase className="h-6 w-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Welcome, {user.firstName || 'Recruiter'}!
            </h2>
            <p className="text-slate-600">
              You're viewing the recruiter dashboard. Here you can manage job postings,
              review candidates, and track your hiring pipeline.
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Job Postings</h3>
          <p className="text-sm text-slate-600">Create and manage your job listings</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Candidates</h3>
          <p className="text-sm text-slate-600">Review and manage candidate applications</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Analytics</h3>
          <p className="text-sm text-slate-600">View hiring metrics and insights</p>
        </div>
      </div>
    </div>
  );
}

