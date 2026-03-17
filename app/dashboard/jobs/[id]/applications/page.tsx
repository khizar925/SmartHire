'use client';

import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Users, GraduationCap,
    Award, FileText, Loader2, AlertCircle,
    User, CheckCircle, XCircle, Search, Filter, ArrowUpDown, Briefcase
} from 'lucide-react';
import { Button } from '@/components/Button';
import {
    Pagination, PaginationContent, PaginationEllipsis,
    PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { useApplications, type Application } from '@/lib/queries/applications';
import { useRecruiterJobs } from '@/lib/queries/jobs';
import { useUpdateApplicationStatus } from '@/lib/mutations/applications';

export default function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    // Rejection modal
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [selectedAppId, setSelectedAppId]   = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionError, setRejectionError]   = useState<string | null>(null);

    // Filter / sort
    const [searchQuery,     setSearchQuery]     = useState('');
    const [educationFilter, setEducationFilter] = useState<string>('all');
    const [sortConfigs, setSortConfigs] = useState<{ key: 'score' | 'experience'; order: 'asc' | 'desc' }[]>(
        [{ key: 'score', order: 'desc' }]
    );

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // ── Data ──────────────────────────────────────────────────────────────────
    const { data: applications = [], isLoading, error, refetch } = useApplications(id);
    const { data: jobs = [] } = useRecruiterJobs();
    const updateStatus = useUpdateApplicationStatus(id);

    const job = jobs.find(j => j.id === id) ?? null;

    // ── Status update ─────────────────────────────────────────────────────────
    const handleUpdateStatus = async (applicationId: string, status: string, feedback?: string) => {
        try {
            await updateStatus.mutateAsync({ applicationId, status, feedback });
            return true;
        } catch {
            alert('Failed to update status');
            return false;
        }
    };

    const handleRejectClick = (applicationId: string) => {
        setSelectedAppId(applicationId);
        setRejectionReason('');
        setRejectionError(null);
        setIsRejectionModalOpen(true);
    };

    const handleConfirmRejection = async () => {
        if (!rejectionReason.trim()) { setRejectionError('Please provide a reason for rejection.'); return; }
        if (selectedAppId) {
            const ok = await handleUpdateStatus(selectedAppId, 'rejected', rejectionReason);
            if (ok) { setIsRejectionModalOpen(false); setSelectedAppId(null); }
        }
    };

    // ── Sort toggle ───────────────────────────────────────────────────────────
    const toggleSort = (key: 'score' | 'experience') => {
        setSortConfigs(prev => {
            const idx = prev.findIndex(c => c.key === key);
            if (idx === -1) return [...prev, { key, order: 'desc' }];
            if (prev[idx].order === 'desc') { const next = [...prev]; next[idx] = { ...prev[idx], order: 'asc' }; return next; }
            return prev.filter(c => c.key !== key);
        });
        setCurrentPage(1);
    };

    // ── Derived data ──────────────────────────────────────────────────────────
    const uniqueEducationLevels = useMemo(() =>
        Array.from(new Set(applications.map(a => a.education_level))).filter(Boolean).sort()
    , [applications]);

    const filteredAndSorted = useMemo(() => {
        let result = applications.filter(app => {
            const matchSearch = app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchEdu = educationFilter === 'all' || app.education_level.toLowerCase() === educationFilter.toLowerCase();
            return matchSearch && matchEdu;
        });

        if (sortConfigs.length > 0) {
            result.sort((a, b) => {
                for (const cfg of sortConfigs) {
                    let cmp = 0;
                    if (cfg.key === 'score') {
                        const sa = a.scores?.[0]?.score ?? -1;
                        const sb = b.scores?.[0]?.score ?? -1;
                        cmp = sa - sb;
                    } else {
                        cmp = a.years_of_experience - b.years_of_experience;
                    }
                    if (cmp !== 0) return cfg.order === 'asc' ? cmp : -cmp;
                }
                return 0;
            });
        }
        return result;
    }, [applications, searchQuery, educationFilter, sortConfigs]);

    const paginated   = useMemo(() => filteredAndSorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredAndSorted, currentPage]);
    const totalPages  = Math.ceil(filteredAndSorted.length / itemsPerPage);

    const getRankStyle = (i: number) => {
        if (i === 0) return 'bg-amber-100 text-amber-700 border border-amber-200';
        if (i === 1) return 'bg-slate-100 text-slate-600 border border-slate-200';
        if (i === 2) return 'bg-orange-50 text-orange-700 border border-orange-100';
        return 'bg-white text-slate-400 border border-slate-100';
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 p-2 md:p-3">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-4 group">
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Applications</h1>
                            {job && (
                                <p className="text-lg text-slate-600">
                                    Candidates for <span className="font-semibold text-primary-600">{job.job_title}</span>
                                </p>
                            )}
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-3">
                            <Users className="h-5 w-5 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700">
                                {applications.length} {applications.length === 1 ? 'Applicant' : 'Applicants'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                {!isLoading && !error && applications.length > 0 && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input type="text" placeholder="Search by name or email..." value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <select value={educationFilter} onChange={e => { setEducationFilter(e.target.value); setCurrentPage(1); }}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none">
                                <option value="all">All Education Levels</option>
                                {uniqueEducationLevels.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 flex-1">
                                {(['score', 'experience'] as const).map(key => (
                                    <button key={key} onClick={() => toggleSort(key)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${sortConfigs.some(c => c.key === key) ? 'bg-white shadow-sm text-primary-600 border border-slate-100' : 'text-slate-500 hover:bg-white/50'}`}>
                                        {key === 'score' ? <Award className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
                                        {sortConfigs.find(c => c.key === key)?.order === 'asc' ? '↑' : sortConfigs.find(c => c.key === key)?.order === 'desc' ? '↓' : ''}
                                        {key === 'score' ? 'Score' : 'Exp.'}
                                    </button>
                                ))}
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
                        <p className="text-red-700 mb-6">Failed to load applications</p>
                        <Button onClick={() => refetch()} variant="outline" className="bg-white">Retry Connection</Button>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
                        <Users className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Applications Yet</h3>
                        <p className="text-slate-500 max-w-md mx-auto">This job posting hasn&apos;t received any applications yet.</p>
                    </div>
                ) : filteredAndSorted.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
                        <Search className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Matches Found</h3>
                        <p className="text-slate-500 max-w-md mx-auto">Adjust your search or filters to see more candidates.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-200">
                                            {['Rank', 'Candidate', 'Status', 'Score', 'Experience', 'Education', 'Actions'].map(h => (
                                                <th key={h} className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {paginated.map((app: Application, pageIdx) => {
                                            const globalIdx = (currentPage - 1) * itemsPerPage + pageIdx;
                                            const score = app.scores?.[0]?.score;
                                            const hasScore = score !== undefined && score !== null;
                                            const isUpdating = updateStatus.isPending && updateStatus.variables?.applicationId === app.id;

                                            return (
                                                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${getRankStyle(globalIdx)}`}>
                                                            {globalIdx + 1}
                                                        </span>
                                                    </td>
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
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${app.status === 'shortlisted' ? 'bg-green-50 text-green-700 border-green-100' : app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {hasScore ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-base">
                                                                    {score!.toFixed(1)}
                                                                </div>
                                                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${score}%` }} />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300 text-xs italic">Not Ranked</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <Briefcase className="h-4 w-4 text-slate-400" />
                                                            <span className="font-medium text-sm">{app.years_of_experience} Yrs</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <GraduationCap className="h-4 w-4 text-slate-400" />
                                                            <span className="font-medium text-sm capitalize">{app.education_level}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <a href={app.resume_url} target="_blank" rel="noopener noreferrer" title="View Resume"
                                                                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                                                                <FileText className="h-4 w-4" />
                                                            </a>
                                                            {app.status === 'pending' && (
                                                                <>
                                                                    <button onClick={() => handleUpdateStatus(app.id, 'shortlisted')} disabled={isUpdating} title="Shortlist"
                                                                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50">
                                                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                                                    </button>
                                                                    <button onClick={() => handleRejectClick(app.id)} disabled={isUpdating} title="Reject"
                                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50">
                                                                        <XCircle className="h-4 w-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {app.status === 'rejected' && app.rejection_feedback && (
                                                                <div className="relative group/tip">
                                                                    <AlertCircle className="h-5 w-5 text-red-400 cursor-help" />
                                                                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                                                                        <p className="font-bold mb-1 uppercase tracking-widest text-[10px] text-slate-400">Rejection Feedback</p>
                                                                        <p className="italic leading-relaxed">&quot;{app.rejection_feedback}&quot;</p>
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

                        {totalPages > 1 && (
                            <div className="mt-4 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
                                        </PaginationItem>
                                        {(() => {
                                            const items: (number | string)[] = [1];
                                            if (currentPage > 3) items.push('e1');
                                            const start = Math.max(2, currentPage - 1);
                                            const end   = Math.min(totalPages - 1, currentPage + 1);
                                            for (let i = start; i <= end; i++) items.push(i);
                                            if (currentPage < totalPages - 2) items.push('e2');
                                            if (totalPages > 1) items.push(totalPages);
                                            return items.map((item, idx) => (
                                                <PaginationItem key={idx}>
                                                    {typeof item === 'string'
                                                        ? <PaginationEllipsis />
                                                        : <PaginationLink isActive={currentPage === item} onClick={() => setCurrentPage(item)}>{item}</PaginationLink>
                                                    }
                                                </PaginationItem>
                                            ));
                                        })()}
                                        <PaginationItem>
                                            <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Rejection Modal */}
            {isRejectionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsRejectionModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Provide Feedback</h3>
                            <button onClick={() => setIsRejectionModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <ArrowLeft className="h-5 w-5 rotate-180" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">Please provide a reason for rejection. This feedback will be shared with the candidate.</p>
                            <textarea value={rejectionReason} onChange={e => { setRejectionReason(e.target.value); setRejectionError(null); }}
                                className={`w-full p-4 border rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${rejectionError ? 'border-red-500' : 'border-slate-200'}`}
                                placeholder="e.g., Lacks required experience in React..." />
                            {rejectionError && <p className="text-sm text-red-600 font-medium">{rejectionError}</p>}
                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" className="flex-1" onClick={() => setIsRejectionModalOpen(false)}>Cancel</Button>
                                <Button variant="primary" className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleConfirmRejection} disabled={updateStatus.isPending}>
                                    {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Rejection'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
