import { currentUser } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import type { UserRole } from '@/types';
import { RecruiterDashboard } from '@/components/RecruiterDashboard';
import { CandidateDashboard } from '@/components/CandidateDashboard';

export default async function DashboardPage() {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as UserRole | undefined;

  // No need to redirect here as layout handles it, but keeping for type safety
  if (!user || !role) return null;

  const firstName = user.firstName || undefined;

  return (
    <div className="animate-fade-in-up">

      {/* Role-based Content */}
      {role === 'candidate' ? (
        <CandidateDashboard firstName={firstName} />
      ) : (
        <div className="space-y-8">
          <RecruiterDashboard firstName={firstName} />
        </div>
      )}
    </div>
  );
}
