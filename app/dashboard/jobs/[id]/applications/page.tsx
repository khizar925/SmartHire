'use client';

import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Users, GraduationCap,
    Award, FileText, Loader2, AlertCircle,
    User, CheckCircle, XCircle, Search, Filter, ArrowUpDown, Briefcase, RefreshCw,
    Calendar, Clock, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Button } from '@/components/Button';
import {
    Pagination, PaginationContent, PaginationEllipsis,
    PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { useApplications, type Application } from '@/lib/queries/applications';
import { useRecruiterJobs } from '@/lib/queries/jobs';
import { useUpdateApplicationStatus } from '@/lib/mutations/applications';

// Pure frontend — no dependencies, no API calls
function buildGoogleCalendarUrl(
    candidateName: string,
    jobTitle: string,
    companyName: string,
    date: string, // YYYY-MM-DD
    time: string, // HH:MM
): string {
    const [y, mo, d] = date.split('-');
    const [h, mi] = time.split(':');
    const endHour = String(parseInt(h) + 1).padStart(2, '0');
    // Timed event format (local, no Z — Google Calendar uses the user's calendar timezone)
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `Interview: ${candidateName} — ${jobTitle} at ${companyName}`,
        dates: `${y}${mo}${d}T${h}${mi}00/${y}${mo}${d}T${endHour}${mi}00`,
        details: `Interview with ${candidateName} for the ${jobTitle} position at ${companyName}.\n\nScheduled via SmartHire.`,
        location: companyName,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    // Retry score
    const [retryingId, setRetryingId] = useState<string | null>(null);
    const [retryError, setRetryError] = useState<{ id: string; message: string } | null>(null);

    const handleRetryScore = async (applicationId: string) => {
        setRetryingId(applicationId);
        setRetryError(null);
        try {
            const res = await fetch('/api/application/retry-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId }),
            });
            if (res.ok) {
                await refetch();
            } else {
                const data = await res.json();
                setRetryError({ id: applicationId, message: data.error || 'Scoring failed. Try again.' });
            }
        } catch {
            setRetryError({ id: applicationId, message: 'Scoring service unavailable. Try again later.' });
        } finally {
            setRetryingId(null);
        }
    };

    // Rejection modal
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [selectedAppId, setSelectedAppId]   = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionError, setRejectionError]   = useState<string | null>(null);

    // Interview scheduling modal
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [scheduleAppId, setScheduleAppId] = useState<string | null>(null);
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewTime, setInterviewTime] = useState('');
    const [scheduleError, setScheduleError] = useState<string | null>(null);
    const [confirmedCalUrl, setConfirmedCalUrl] = useState<string | null>(null);

    const TIME_SLOTS = [
        '09:00','09:30','10:00','10:30','11:00','11:30',
        '12:00','12:30','13:00','13:30','14:00','14:30',
        '15:00','15:30','16:00','16:30','17:00','17:30','18:00',
    ];
    const formatTime = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return `${h % 12 || 12}:${m.toString().padStart(2,'0')} ${h < 12 ? 'AM' : 'PM'}`;
    };
    const today = new Date().toISOString().split('T')[0];

    // Filter / sort
    const [searchQuery,     setSearchQuery]     = useState('');
    const [educationFilter, setEducationFilter] = useState<string>('all');
    const [statusFilter,    setStatusFilter]    = useState<string>('all');
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
    const handleUpdateStatus = async (applicationId: string, status: string, feedback?: string, interviewDate?: string, interviewTime?: string) => {
        try {
            await updateStatus.mutateAsync({ applicationId, status, feedback, interviewDate, interviewTime });
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

    const handleShortlistClick = (applicationId: string) => {
        setScheduleAppId(applicationId);
        setInterviewDate('');
        setInterviewTime('');
        setScheduleError(null);
        setConfirmedCalUrl(null);
        setIsScheduleModalOpen(true);
    };

    const handleConfirmSchedule = async () => {
        if (!interviewDate) { setScheduleError('Please select an interview date.'); return; }
        if (!interviewTime) { setScheduleError('Please select a time slot.'); return; }
        if (scheduleAppId) {
            const ok = await handleUpdateStatus(scheduleAppId, 'shortlisted', undefined, interviewDate, interviewTime);
            if (ok) {
                const app = applications.find(a => a.id === scheduleAppId);
                const calUrl = buildGoogleCalendarUrl(
                    app?.full_name ?? 'Candidate',
                    job?.job_title ?? 'Interview',
                    job?.company_name ?? '',
                    interviewDate,
                    interviewTime,
                );
                setConfirmedCalUrl(calUrl);
                // Stay in modal — show calendar step
            }
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
            const matchStatus = statusFilter === 'all' || app.status === statusFilter;
            return matchSearch && matchEdu && matchStatus;
        });

        if (sortConfigs.length > 0) {
            result.sort((a, b) => {
                for (const cfg of sortConfigs) {
                    let cmp = 0;
                    if (cfg.key === 'score') {
                        const rawA = a.scores?.[0]?.score;
                        const rawB = b.scores?.[0]?.score;
                        const sa = (!rawA || rawA === -1) ? -1 : rawA;
                        const sb = (!rawB || rawB === -1) ? -1 : rawB;
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
    }, [applications, searchQuery, educationFilter, statusFilter, sortConfigs]);

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
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                            <CheckCircle className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none">
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="review">Under Review</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="rejected">Rejected</option>
                                <option value="hired">Hired</option>
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
                                            const isPending = score === -1;
                                            const hasScore = score !== undefined && score !== null && !isPending;
                                            const isUpdating = updateStatus.isPending && updateStatus.variables?.applicationId === app.id;
                                            const isRetrying = retryingId === app.id;

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
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                                            app.status === 'shortlisted' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                                                            app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                            app.status === 'hired' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                            'bg-blue-50 text-blue-700 border-blue-100'
                                                        }`}>
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
                                                        ) : isPending ? (
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wider">
                                                                        Pending
                                                                    </span>
                                                                    <button
                                                                        onClick={() => handleRetryScore(app.id)}
                                                                        disabled={isRetrying}
                                                                        title="Retry scoring"
                                                                        className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-amber-50 hover:text-amber-600 transition-colors disabled:opacity-50"
                                                                    >
                                                                        {isRetrying
                                                                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                            : <RefreshCw className="h-3.5 w-3.5" />
                                                                        }
                                                                    </button>
                                                                </div>
                                                                {retryError?.id === app.id && (
                                                                    <p className="text-[10px] text-red-500 max-w-[140px] leading-tight">
                                                                        {retryError.message}
                                                                    </p>
                                                                )}
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
                                                            <a href={`/api/resume?path=${encodeURIComponent(app.resume_url)}`} target="_blank" rel="noopener noreferrer" title="View Resume"
                                                                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                                                                <FileText className="h-4 w-4" />
                                                            </a>
                                                            {app.status === 'pending' && (
                                                                <>
                                                                    <button onClick={() => handleShortlistClick(app.id)} disabled={isUpdating} title="Shortlist & Schedule Interview"
                                                                        className="p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors disabled:opacity-50">
                                                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                                                                    </button>
                                                                    <button onClick={() => handleRejectClick(app.id)} disabled={isUpdating} title="Reject"
                                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50">
                                                                        <XCircle className="h-4 w-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {app.status === 'shortlisted' && (
                                                                <>
                                                                    <button onClick={() => handleUpdateStatus(app.id, 'hired')} disabled={isUpdating} title="Mark as Hired"
                                                                        className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50">
                                                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                                                                    </button>
                                                                    <button onClick={() => handleRejectClick(app.id)} disabled={isUpdating} title="Reject"
                                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50">
                                                                        <ThumbsDown className="h-4 w-4" />
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

            {/* Interview Scheduling Modal */}
            {isScheduleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setIsScheduleModalOpen(false); setConfirmedCalUrl(null); }} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden">

                        {confirmedCalUrl ? (
                            /* ── Calendar step ── */
                            <div className="flex flex-col items-center text-center gap-5">
                                <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full">
                                    <CheckCircle className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Interview Scheduled!</h3>
                                    <p className="text-sm text-slate-500 mt-1">Candidate notified by email. Add this to your calendar:</p>
                                </div>
                                <a
                                    href={confirmedCalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-sky-400 hover:bg-sky-50 transition-all text-sm font-semibold text-slate-700 hover:text-sky-700"
                                >
                                    <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                                        <rect width="24" height="24" rx="4" fill="#4285F4"/>
                                        <rect x="3" y="3" width="18" height="18" rx="2" fill="white"/>
                                        <path d="M17 3H7a4 4 0 00-4 4v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4z" stroke="#4285F4" strokeWidth="0.5" fill="white"/>
                                        <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#4285F4">CAL</text>
                                    </svg>
                                    Add to Google Calendar
                                </a>
                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={() => { setIsScheduleModalOpen(false); setConfirmedCalUrl(null); setScheduleAppId(null); }}
                                >
                                    Done
                                </Button>
                            </div>
                        ) : (
                            /* ── Scheduling form ── */
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 bg-sky-100 text-sky-600 rounded-xl">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Schedule Interview</h3>
                                        <p className="text-sm text-slate-500">Candidate will be notified by email</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" /> Interview Date
                                        </label>
                                        <input
                                            type="date"
                                            value={interviewDate}
                                            min={today}
                                            onChange={e => { setInterviewDate(e.target.value); setScheduleError(null); }}
                                            className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-slate-400" /> Time Slot
                                        </label>
                                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                                            {TIME_SLOTS.map(slot => (
                                                <button
                                                    key={slot}
                                                    onClick={() => { setInterviewTime(slot); setScheduleError(null); }}
                                                    className={`py-2 px-1 rounded-lg text-xs font-semibold border transition-all ${interviewTime === slot ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                                                >
                                                    {formatTime(slot)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {scheduleError && <p className="text-sm text-red-600 font-medium">{scheduleError}</p>}
                                    <div className="flex gap-3 pt-2">
                                        <Button variant="outline" className="flex-1" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
                                        <Button variant="primary" className="flex-1" onClick={handleConfirmSchedule} disabled={updateStatus.isPending}>
                                            {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Shortlist & Send Invite'}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

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
