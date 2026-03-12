'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Users, GraduationCap,
    Award, FileText, Loader2, AlertCircle,
    User, CheckCircle, XCircle, Search, Filter, ArrowUpDown, Briefcase
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
} from "@/components/ui/pagination";

interface Application {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    education_level: string;
    years_of_experience: number;
    cover_letter: string;
    resume_url: string;
    rejection_feedback?: string;
    status: string;
    created_at: string;
    scores?: { score: number }[];
}

interface Job {
    id: string;
    job_title: string;
    company_name: string;
}

export default function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    // Core data
    const [applications, setApplications] = useState<Application[]>([]);
    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Rejection modal
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionError, setRejectionError] = useState<string | null>(null);

    // Filter / sort
    const [searchQuery, setSearchQuery] = useState('');
    const [educationFilter, setEducationFilter] = useState<string>('all');
    const [sortConfigs, setSortConfigs] = useState<{ key: 'score' | 'experience'; order: 'asc' | 'desc' }[]>(
        [{ key: 'score', order: 'desc' }]
    );

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const jobRes = await fetch(`/api/jobs`);
            const jobData = await jobRes.json();
            const currentJob = jobData.jobs?.find((j: Job) => j.id === id);
            setJob(currentJob || null);

            const appRes = await fetch(`/api/application?jobId=${id}`);
            const appData = await appRes.json();

            if (appRes.ok) {
                setApplications(appData.applications || []);
            } else {
                setError(appData.error || 'Failed to load applications');
            }
        } catch {
            setError('An error occurred while fetching data');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Status update ──────────────────────────────────────────────────────────

    const handleUpdateStatus = async (applicationId: string, status: string, feedback?: string) => {
        setUpdatingId(applicationId);
        try {
            const response = await fetch('/api/application', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId, status, feedback }),
            });

            if (response.ok) {
                setApplications(prev =>
                    prev.map(app =>
                        app.id === applicationId ? { ...app, status, rejection_feedback: feedback } : app
                    )
                );
                return true;
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to update status');
                return false;
            }
        } catch {
            alert('An unexpected error occurred');
            return false;
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRejectClick = (applicationId: string) => {
        setSelectedAppId(applicationId);
        setRejectionReason('');
        setRejectionError(null);
        setIsRejectionModalOpen(true);
    };

    const handleConfirmRejection = async () => {
        if (!rejectionReason.trim()) {
            setRejectionError('Please provide a reason for rejection.');
            return;
        }
        if (selectedAppId) {
            const success = await handleUpdateStatus(selectedAppId, 'rejected', rejectionReason);
            if (success) {
                setIsRejectionModalOpen(false);
                setSelectedAppId(null);
            }
        }
    };

    // ── Sort toggle ────────────────────────────────────────────────────────────

    const toggleSort = (key: 'score' | 'experience') => {
        setSortConfigs(prev => {
            const existingIndex = prev.findIndex(c => c.key === key);
            if (existingIndex === -1) {
                return [...prev, { key, order: 'desc' }];
            }
            const existing = prev[existingIndex];
            if (existing.order === 'desc') {
                const next = [...prev];
                next[existingIndex] = { ...existing, order: 'asc' };
                return next;
            }
            return prev.filter(c => c.key !== key);
        });
        setCurrentPage(1);
    };

    // ── Derived data ───────────────────────────────────────────────────────────

    const uniqueEducationLevels = useMemo(() => {
        const levels = applications.map(app => app.education_level);
        return Array.from(new Set(levels)).filter(Boolean).sort();
    }, [applications]);

    const filteredAndSortedApplications = useMemo(() => {
        let result = applications.filter(app => {
            const matchesSearch =
                app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesEducation =
                educationFilter === 'all' ||
                app.education_level.toLowerCase() === educationFilter.toLowerCase();
            return matchesSearch && matchesEducation;
        });

        if (sortConfigs.length > 0) {
            result.sort((a, b) => {
                for (const config of sortConfigs) {
                    let comparison = 0;
                    if (config.key === 'score') {
                        // Push unscored applications to the bottom
                        const scoreA = a.scores?.[0]?.score ?? -1;
                        const scoreB = b.scores?.[0]?.score ?? -1;
                        comparison = scoreA - scoreB;
                    } else if (config.key === 'experience') {
                        comparison = a.years_of_experience - b.years_of_experience;
                    }
                    if (comparison !== 0) {
                        return config.order === 'asc' ? comparison : -comparison;
                    }
                }
                return 0;
            });
        }

        return result;
    }, [applications, searchQuery, educationFilter, sortConfigs]);

    const paginatedApplications = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedApplications.slice(start, start + itemsPerPage);
    }, [filteredAndSortedApplications, currentPage]);

    const totalPages = Math.ceil(filteredAndSortedApplications.length / itemsPerPage);

    // ── Rank badge helper ──────────────────────────────────────────────────────

    const getRankStyle = (globalIndex: number) => {
        if (globalIndex === 0) return 'bg-amber-100 text-amber-700 border border-amber-200';
        if (globalIndex === 1) return 'bg-slate-100 text-slate-600 border border-slate-200';
        if (globalIndex === 2) return 'bg-orange-50 text-orange-700 border border-orange-100';
        return 'bg-white text-slate-400 border border-slate-100';
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-slate-50 p-2 md:p-3">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-4 group"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Applications</h1>
                            {job && (
                                <p className="text-lg text-slate-600">
                                    Candidates for{' '}
                                    <span className="font-semibold text-primary-600">{job.job_title}</span>
                                </p>
                            )}
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-3">
                            <Users className="h-5 w-5 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700">
                                {applications.length}{' '}
                                {applications.length === 1 ? 'Applicant' : 'Applicants'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                {!isLoading && !error && applications.length > 0 && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={e => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            />
                        </div>

                        {/* Education filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <select
                                value={educationFilter}
                                onChange={e => {
                                    setEducationFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none"
                            >
                                <option value="all">All Education Levels</option>
                                {uniqueEducationLevels.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort toggles */}
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 flex-1">
                                <button
                                    onClick={() => toggleSort('score')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                                        sortConfigs.some(c => c.key === 'score')
                                            ? 'bg-white shadow-sm text-primary-600 border border-slate-100'
                                            : 'text-slate-500 hover:bg-white/50'
                                    }`}
                                >
                                    <Award className="h-3 w-3" />
                                    {sortConfigs.find(c => c.key === 'score')?.order === 'asc'
                                        ? '↑'
                                        : sortConfigs.find(c => c.key === 'score')?.order === 'desc'
                                        ? '↓'
                                        : ''}{' '}
                                    Score
                                </button>
                                <button
                                    onClick={() => toggleSort('experience')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                                        sortConfigs.some(c => c.key === 'experience')
                                            ? 'bg-white shadow-sm text-primary-600 border border-slate-100'
                                            : 'text-slate-500 hover:bg-white/50'
                                    }`}
                                >
                                    <Briefcase className="h-3 w-3" />
                                    {sortConfigs.find(c => c.key === 'experience')?.order === 'asc'
                                        ? '↑'
                                        : sortConfigs.find(c => c.key === 'experience')?.order === 'desc'
                                        ? '↓'
                                        : ''}{' '}
                                    Exp.
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-slate-200">
                        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
                        <p className="text-slate-500 font-medium">Loading applicant data...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 p-8 rounded-2xl text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load Data</h3>
                        <p className="text-red-700 mb-6">{error}</p>
                        <Button onClick={fetchData} variant="outline" className="bg-white">
                            Retry Connection
                        </Button>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
                        <Users className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Applications Yet</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            This job posting hasn't received any applications yet. Make sure your job details
                            are up to date to attract more candidates.
                        </p>
                    </div>
                ) : filteredAndSortedApplications.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
                        <Search className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Matches Found</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Adjust your search or filters to see more candidates.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-200">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Rank</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Candidate</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Score</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Experience</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Education</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedApplications.map((app, pageIndex) => {
                                            const globalIndex = (currentPage - 1) * itemsPerPage + pageIndex;
                                            const scoreValue = app.scores?.[0]?.score;
                                            const hasScore = scoreValue !== undefined && scoreValue !== null;

                                            return (
                                                <tr
                                                    key={app.id}
                                                    className="hover:bg-slate-50/50 transition-colors group"
                                                >
                                                    {/* Rank */}
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${getRankStyle(globalIndex)}`}
                                                        >
                                                            {globalIndex + 1}
                                                        </span>
                                                    </td>

                                                    {/* Candidate */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                                <User className="h-5 w-5 text-primary-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900">{app.full_name}</p>
                                                                <p className="text-xs text-slate-500">{app.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                                                app.status === 'shortlisted'
                                                                    ? 'bg-green-50 text-green-700 border-green-100'
                                                                    : app.status === 'rejected'
                                                                    ? 'bg-red-50 text-red-700 border-red-100'
                                                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                                                            }`}
                                                        >
                                                            {app.status}
                                                        </span>
                                                    </td>

                                                    {/* Score */}
                                                    <td className="px-6 py-4">
                                                        {hasScore ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-base">
                                                                    {scoreValue!.toFixed(1)}
                                                                </div>
                                                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-indigo-500 transition-all duration-700"
                                                                        style={{ width: `${scoreValue}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300 text-xs italic">Not Ranked</span>
                                                        )}
                                                    </td>

                                                    {/* Experience */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <Briefcase className="h-4 w-4 text-slate-400" />
                                                            <span className="font-medium text-sm">
                                                                {app.years_of_experience} Yrs
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Education */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <GraduationCap className="h-4 w-4 text-slate-400" />
                                                            <span className="font-medium text-sm capitalize">
                                                                {app.education_level}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* Resume */}
                                                            <a
                                                                href={app.resume_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="View Resume"
                                                                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                            </a>

                                                            {/* Accept / Reject (pending only) */}
                                                            {app.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                                                                        disabled={updatingId === app.id}
                                                                        title="Shortlist"
                                                                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                                                    >
                                                                        {updatingId === app.id ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                        ) : (
                                                                            <CheckCircle className="h-4 w-4" />
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRejectClick(app.id)}
                                                                        disabled={updatingId === app.id}
                                                                        title="Reject"
                                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                    </button>
                                                                </>
                                                            )}

                                                            {/* Rejection feedback tooltip */}
                                                            {app.status === 'rejected' && app.rejection_feedback && (
                                                                <div className="relative group/tip">
                                                                    <AlertCircle className="h-5 w-5 text-red-400 cursor-help" />
                                                                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                                                                        <p className="font-bold mb-1 uppercase tracking-widest text-[10px] text-slate-400">
                                                                            Rejection Feedback
                                                                        </p>
                                                                        <p className="italic leading-relaxed">
                                                                            "{app.rejection_feedback}"
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-4 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                            />
                                        </PaginationItem>

                                        {(() => {
                                            const siblingCount = 1;
                                            const items: (number | string)[] = [1];

                                            if (currentPage > siblingCount + 2) items.push('ellipsis-start');

                                            const start = Math.max(2, currentPage - siblingCount);
                                            const end = Math.min(totalPages - 1, currentPage + siblingCount);
                                            for (let i = start; i <= end; i++) items.push(i);

                                            if (currentPage < totalPages - siblingCount - 1) items.push('ellipsis-end');
                                            if (totalPages > 1) items.push(totalPages);

                                            return items.map((item, idx) => (
                                                <PaginationItem key={idx}>
                                                    {item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                                                        <PaginationEllipsis />
                                                    ) : (
                                                        <PaginationLink
                                                            isActive={currentPage === item}
                                                            onClick={() => setCurrentPage(item as number)}
                                                        >
                                                            {item}
                                                        </PaginationLink>
                                                    )}
                                                </PaginationItem>
                                            ));
                                        })()}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

            {/* Rejection Feedback Modal */}
            {isRejectionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsRejectionModalOpen(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Provide Feedback</h3>
                            <button
                                onClick={() => setIsRejectionModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <ArrowLeft className="h-5 w-5 rotate-180" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">
                                Please provide a reason for rejection. This feedback will be shared with the
                                candidate to help them improve.
                            </p>

                            <textarea
                                value={rejectionReason}
                                onChange={e => {
                                    setRejectionReason(e.target.value);
                                    setRejectionError(null);
                                }}
                                className={`w-full p-4 border rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                    rejectionError ? 'border-red-500' : 'border-slate-200'
                                }`}
                                placeholder="e.g., Lacks required experience in React..."
                            />

                            {rejectionError && (
                                <p className="text-sm text-red-600 font-medium">{rejectionError}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setIsRejectionModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                    onClick={handleConfirmRejection}
                                    disabled={updatingId !== null}
                                >
                                    {updatingId ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Confirm Rejection'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
