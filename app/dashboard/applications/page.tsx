'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    ClipboardList, Loader2, AlertCircle, FileText,
    Building2, MapPin, Briefcase, ChevronDown, ChevronUp,
    LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/Button';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface ApplicationJob {
    job_title: string;
    company_name: string;
    job_location: string;
    employment_type: string;
    status: string;
}

interface Application {
    id: string;
    status: string;
    rejection_feedback: string | null;
    created_at: string;
    resume_url: string;
    jobs: ApplicationJob | null;
}

const STATUS_STYLES: Record<string, string> = {
    pending:     'bg-amber-50 text-amber-700 border-amber-200',
    shortlisted: 'bg-green-50 text-green-700 border-green-200',
    rejected:    'bg-red-50 text-red-700 border-red-200',
};

function formatDate(iso: string) {
    const date = new Date(iso);
    const now  = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60)               return 'Just now';
    if (diff < 3600)             return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)            return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 86400 * 7)        return `${Math.floor(diff / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const ITEMS_PER_PAGE = 10;

export default function MyApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading]       = useState(true);
    const [error, setError]               = useState<string | null>(null);
    const [currentPage, setCurrentPage]   = useState(1);
    const [expandedFeedback, setExpandedFeedback] = useState<Set<string>>(new Set());

    const fetchApplications = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/candidate/applications');
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to load applications');
            } else {
                setApplications(data.applications || []);
            }
        } catch {
            setError('An error occurred while fetching your applications');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchApplications(); }, []);

    const toggleFeedback = (id: string) => {
        setExpandedFeedback(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const paginatedApplications = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return applications.slice(start, start + ITEMS_PER_PAGE);
    }, [applications, currentPage]);

    const totalPages = Math.ceil(applications.length / ITEMS_PER_PAGE);

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-slate-50 p-2 md:p-3">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center">
                            <ClipboardList className="h-5 w-5 text-primary-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
                    </div>
                    <p className="text-slate-500 text-sm ml-[52px]">
                        Track every job you have applied for and see live status updates.
                    </p>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-slate-200">
                        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
                        <p className="text-slate-500 font-medium">Loading your applications...</p>
                    </div>

                ) : error ? (
                    <div className="bg-red-50 border border-red-200 p-8 rounded-2xl text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load</h3>
                        <p className="text-red-700 mb-6">{error}</p>
                        <Button onClick={fetchApplications} variant="outline" className="bg-white">
                            Retry
                        </Button>
                    </div>

                ) : applications.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
                        <ClipboardList className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Applications Yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-6">
                            You haven&apos;t applied to any jobs yet. Start exploring open positions.
                        </p>
                        <Link href="/dashboard">
                            <Button variant="primary" className="flex items-center gap-2">
                                <LayoutDashboard className="h-4 w-4" />
                                Browse Jobs
                            </Button>
                        </Link>
                    </div>

                ) : (
                    <>
                        <div className="text-xs text-slate-400 font-medium mb-4 ml-1">
                            {applications.length} application{applications.length !== 1 ? 's' : ''} total
                        </div>

                        <div className="space-y-3">
                            {paginatedApplications.map((app) => {
                                const hasFeedback = app.status === 'rejected' && !!app.rejection_feedback;
                                const isExpanded = expandedFeedback.has(app.id);
                                const job        = app.jobs;

                                return (
                                    <div
                                        key={app.id}
                                        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                                    >
                                        <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">

                                            {/* Left: job info */}
                                            <div className="flex-1 min-w-0">
                                                {job ? (
                                                    <>
                                                        <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">
                                                            {job.job_title}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                                                                {job.company_name}
                                                            </span>
                                                            {job.job_location && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                                                    {job.job_location}
                                                                </span>
                                                            )}
                                                            {job.employment_type && (
                                                                <span className="flex items-center gap-1">
                                                                    <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
                                                                    {job.employment_type}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <h3 className="font-medium text-slate-400 italic text-base">
                                                        Job no longer available
                                                    </h3>
                                                )}
                                                <p className="text-xs text-slate-400 mt-2">
                                                    Applied {formatDate(app.created_at)}
                                                </p>
                                            </div>

                                            {/* Right: score + status + resume */}
                                            <div className="flex items-center gap-3 flex-shrink-0">
    
                                                {/* Status badge */}
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${STATUS_STYLES[app.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                    {app.status}
                                                </span>

                                                {/* Resume link */}
                                                <a
                                                    href={`/api/resume?path=${encodeURIComponent(app.resume_url)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="View Resume"
                                                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </a>
                                            </div>
                                        </div>

                                        {/* Rejection feedback (expandable) */}
                                        {hasFeedback && (
                                            <div className="border-t border-slate-100">
                                                <button
                                                    onClick={() => toggleFeedback(app.id)}
                                                    className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <span>Recruiter Feedback</span>
                                                    {isExpanded
                                                        ? <ChevronUp className="h-3.5 w-3.5" />
                                                        : <ChevronDown className="h-3.5 w-3.5" />
                                                    }
                                                </button>
                                                {isExpanded && (
                                                    <div className="px-5 pb-4">
                                                        <p className="text-sm text-slate-600 italic leading-relaxed bg-red-50 rounded-xl p-3 border border-red-100">
                                                            &quot;{app.rejection_feedback}&quot;
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                            />
                                        </PaginationItem>
                                        {(() => {
                                            const items: (number | string)[] = [1];
                                            if (currentPage > 3) items.push('ellipsis-start');
                                            const start = Math.max(2, currentPage - 1);
                                            const end   = Math.min(totalPages - 1, currentPage + 1);
                                            for (let i = start; i <= end; i++) items.push(i);
                                            if (currentPage < totalPages - 2) items.push('ellipsis-end');
                                            if (totalPages > 1) items.push(totalPages);
                                            return items.map((item, idx) => (
                                                <PaginationItem key={idx}>
                                                    {item === 'ellipsis-start' || item === 'ellipsis-end'
                                                        ? <PaginationEllipsis />
                                                        : <PaginationLink
                                                            isActive={currentPage === item}
                                                            onClick={() => setCurrentPage(item as number)}
                                                          >{item}</PaginationLink>
                                                    }
                                                </PaginationItem>
                                            ));
                                        })()}
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
