'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Briefcase, Users, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/Button';
import type { UserRole } from '@/types';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user already has a role and redirect to dashboard
  useEffect(() => {
    if (isLoaded && user) {
      const existingRole = user.publicMetadata?.role as UserRole | undefined;
      if (existingRole) {
        router.push('/dashboard');
      }
    }
  }, [isLoaded, user, router]);

  const handleRoleSelection = async (role: UserRole) => {
    if (isSaving) return; // Prevent double submissions

    setSelectedRole(role);
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch('/api/user/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 409) {
          setError('Your role has already been set and cannot be changed.');
        } else if (response.status === 400) {
          setError(data.error || 'Invalid role selected.');
        } else if (response.status === 401) {
          setError('Please sign in to continue.');
          router.push('/sign-in');
          return;
        } else {
          setError(data.error || 'An error occurred. Please try again.');
        }
        setIsSaving(false);
        return;
      }

      // Success: Update client state and refresh router
      // Small delay to ensure Clerk session updates
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force router refresh to update server components
      router.refresh();
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error saving role:', err);
      setError('Network error. Please check your connection and try again.');
      setIsSaving(false);
    }
  };

  // Show loading state while checking user
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // If user is not authenticated, redirect to sign-in
  if (!user) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 mb-3">
              Welcome to Smart Hire
            </h1>
            <p className="text-lg text-slate-600">
              Please select your role to get started
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Role Selection */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Candidate Option */}
            <button
              onClick={() => handleRoleSelection('candidate')}
              disabled={isSaving}
              className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedRole === 'candidate'
                  ? 'border-primary-600 bg-primary-50 shadow-lg'
                  : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  selectedRole === 'candidate' ? 'bg-primary-100' : 'bg-slate-100'
                }`}>
                  <Users className={`h-6 w-6 ${
                    selectedRole === 'candidate' ? 'text-primary-600' : 'text-slate-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    I'm a Candidate
                  </h3>
                  <p className="text-sm text-slate-600">
                    Looking for job opportunities and want to track my applications
                  </p>
                </div>
              </div>
            </button>

            {/* Recruiter Option */}
            <button
              onClick={() => handleRoleSelection('recruiter')}
              disabled={isSaving}
              className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedRole === 'recruiter'
                  ? 'border-primary-600 bg-primary-50 shadow-lg'
                  : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  selectedRole === 'recruiter' ? 'bg-primary-100' : 'bg-slate-100'
                }`}>
                  <Briefcase className={`h-6 w-6 ${
                    selectedRole === 'recruiter' ? 'text-primary-600' : 'text-slate-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    I'm a Recruiter
                  </h3>
                  <p className="text-sm text-slate-600">
                    Hiring talent and want to manage job postings and candidates
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Loading Indicator */}
          {isSaving && (
            <div className="flex items-center justify-center gap-2 text-primary-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Saving your selection...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

