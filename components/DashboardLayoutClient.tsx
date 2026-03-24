'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const UserButton = dynamic(
    () => import('@clerk/nextjs').then((mod) => ({ default: mod.UserButton })),
    { ssr: false }
);
import { AppSidebar } from '@/components/app-sidebar';
import { ScoreResumeModal } from '@/components/ScoreResumeModal';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { BrainCircuit } from 'lucide-react';
import type { UserRole } from '@/types';

interface DashboardLayoutClientProps {
    children: React.ReactNode;
    role?: UserRole;
    firstName?: string;
}

export function DashboardLayoutClient({ children, role, firstName }: DashboardLayoutClientProps) {
    const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

    if (role === 'recruiter') {
        return (
            <div className="flex min-h-screen w-full bg-slate-50 font-sans">
                <div className="flex flex-col flex-1 min-h-screen w-full relative">
                    <header className="flex h-16 md:h-20 shrink-0 items-center justify-between gap-4 border-b bg-white px-4 md:px-8 sticky top-0 z-10 w-full shadow-sm transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 group">
                                <div className="bg-primary-600 text-white p-2.5 rounded-xl shadow-lg shadow-primary-600/20">
                                    <BrainCircuit className="h-6 w-6" />
                                </div>
                                <span className="text-xl font-bold text-slate-900 font-serif tracking-tight">Smart Hire</span>
                            </div>
                            <div className="h-6 w-px bg-slate-200 hidden md:block ml-2" />
                            <span className="text-sm font-medium text-slate-400 hidden md:block tracking-wide">Recruiter Portal</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </header>
                    <main className="flex-1 w-full p-4 md:p-8">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-slate-50 font-sans">
                <AppSidebar
                    role={role as 'candidate' | 'recruiter'}
                    onOpenScore={() => setIsScoreModalOpen(true)}
                />

                <SidebarInset className="flex flex-col flex-1 min-h-screen transition-all duration-300 relative overflow-hidden">
                    {/* Main Dashboard Header */}
                    <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-sidebar-border px-4 md:px-8 transition-all duration-300 bg-white/80 backdrop-blur-md sticky top-0 z-10 w-full shadow-sm">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="-ml-1 md:-ml-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500" />
                            <div className="h-6 w-px bg-slate-200 hidden md:block" />
                            <span className="text-sm font-medium text-slate-400 hidden md:block tracking-wide">
                                Welcome back, <span className="text-slate-900 font-semibold">{firstName || 'User'}</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </header>

                    <main className="flex-1 w-full bg-slate-50/50 p-4 md:p-8 animate-fade-in overflow-x-hidden">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </SidebarInset>

                <ScoreResumeModal
                    isOpen={isScoreModalOpen}
                    onClose={() => setIsScoreModalOpen(false)}
                />
            </div>
        </SidebarProvider>
    );
}
