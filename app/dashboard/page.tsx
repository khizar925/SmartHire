import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import type { UserRole } from '@/types';
import { RecruiterDashboard } from '@/components/RecruiterDashboard';
import { CandidateDashboard } from '@/components/CandidateDashboard';

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

  // Extract plain data from user object to pass to Client Components
  const firstName = user.firstName || undefined;

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
          <CandidateDashboard firstName={firstName} />
        ) : (
          <RecruiterDashboard firstName={firstName} />
        )}
      </div>
    </div>
  );
}


