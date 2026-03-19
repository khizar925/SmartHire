import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/types';
import { RecruiterDashboard } from '@/components/RecruiterDashboard';
import { CandidateDashboard } from '@/components/CandidateDashboard';

export default async function DashboardPage() {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as UserRole | undefined;

  if (!user) return null;
  if (!role) redirect('/onboarding');

  const firstName = user.firstName || undefined;

  return (
    <div className="animate-fade-in-up">
      {role === 'candidate' ? (
        <CandidateDashboard firstName={firstName} />
      ) : role === 'recruiter' ? (
        <div className="space-y-8">
          <RecruiterDashboard firstName={firstName} />
        </div>
      ) : null}
    </div>
  );
}
