'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Users, Mail, Phone, GraduationCap,
    Award, FileText, Calendar, Loader2, AlertCircle,
    ExternalLink, User, CheckCircle, XCircle
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
    const [applications, setApplications] = useState<Application[]>([]);
    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Rejection Modal State
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionError, setRejectionError] = useState<string | null>(null);
    const [isScoring, setIsScoring] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;



    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch Job Details
            const jobRes = await fetch(`/api/jobs`);
            const jobData = await jobRes.json();
            const currentJob = jobData.jobs?.find((j: Job) => j.id === id);
            setJob(currentJob || null);

            // Fetch Applications
            const appRes = await fetch(`/api/application?jobId=${id}`);
            const appData = await appRes.json();

            if (appRes.ok) {
                setApplications(appData.applications || []);
            } else {
                setError(appData.error || 'Failed to load applications');
            }
        } catch (err) {
            setError('An error occurred while fetching data');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleUpdateStatus = async (applicationId: string, status: string, feedback?: string) => {
        setUpdatingId(applicationId);
        try {
            const response = await fetch('/api/application', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId, status, feedback }),
            });

            if (response.ok) {
                // Update local state
                setApplications(prev => prev.map(app =>
                    app.id === applicationId ? { ...app, status, rejection_feedback: feedback } : app
                ));
                return true;
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to update status');
                return false;
            }
        } catch (err) {
            console.error('Error updating status:', err);
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

    const handleScoreAll = async () => {
        setIsScoring(true);

        try {
            const response = await fetch('/api/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_id: id }),
            });

            if (response.ok) {
                setIsConfirmModalOpen(false);
                router.push(`/dashboard/jobs/${id}/results`);
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to score candidates');
            }
        } catch (err) {
            console.error('Error scoring candidates:', err);
            alert('An unexpected error occurred during analysis');
        } finally {
            setIsScoring(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
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
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Job Applications</h1>
                            {job && (
                                <p className="text-lg text-slate-600">
                                    Showing all candidates for <span className="font-semibold text-primary-600">{job.job_title}</span>
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => setIsConfirmModalOpen(true)}
                                disabled={isScoring || applications.length === 0}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                            >
                                {isScoring ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Award className="h-4 w-4" />
                                        AI Analyze & Rank
                                    </>
                                )}
                            </Button>
                            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-3">
                                <Users className="h-5 w-5 text-slate-400" />
                                <span className="text-sm font-semibold text-slate-700">
                                    {applications.length} {applications.length === 1 ? 'Applicant' : 'Applicants'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

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
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Applications Found</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            This job posting hasn't received any applications yet. Make sure your job details are up to date to attract more candidates.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-200">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Candidate</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Experience</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Education</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Applied On</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Score</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {applications
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map((app) => (
                                                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
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
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${app.status === 'shortlisted' ? 'bg-green-50 text-green-700 border-green-100' :
                                                            app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                'bg-blue-50 text-blue-700 border-blue-100'
                                                            }`}>
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <Award className="h-4 w-4 text-slate-400" />
                                                            <span className="font-medium text-sm">{app.years_of_experience} Years</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <GraduationCap className="h-4 w-4 text-slate-400" />
                                                            <span className="font-medium text-sm capitalize">{app.education_level}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <Calendar className="h-4 w-4 text-slate-400" />
                                                            <span className="font-medium text-sm">{formatDate(app.created_at)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {app.scores && app.scores.length > 0 ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm">
                                                                    {app.scores[0].score.toFixed(1)}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300 text-xs italic">Not Ranked</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <a
                                                                href={app.resume_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="View Resume"
                                                                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                            </a>
                                                            {app.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                                                                        disabled={updatingId === app.id}
                                                                        title="Shortlist"
                                                                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                                                    >
                                                                        {updatingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
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
                                                            {app.status === 'rejected' && app.rejection_feedback && (
                                                                <div className="relative group">
                                                                    <AlertCircle className="h-5 w-5 text-red-400 cursor-help" />
                                                                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                                                                        <p className="font-bold mb-1 uppercase tracking-widest text-[10px] text-slate-400">Rejection Feedback</p>
                                                                        <p className="italic leading-relaxed">"{app.rejection_feedback}"</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {applications.length > itemsPerPage && (
                            <div className="mt-8 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                            />
                                        </PaginationItem>

                                        {(() => {
                                            const totalPages = Math.ceil(applications.length / itemsPerPage);
                                            const items = [];
                                            const siblingCount = 1;

                                            // Always show first page
                                            items.push(1);

                                            if (currentPage > siblingCount + 2) {
                                                items.push('ellipsis-start');
                                            }

                                            const start = Math.max(2, currentPage - siblingCount);
                                            const end = Math.min(totalPages - 1, currentPage + siblingCount);

                                            for (let i = start; i <= end; i++) {
                                                items.push(i);
                                            }

                                            if (currentPage < totalPages - siblingCount - 1) {
                                                items.push('ellipsis-end');
                                            }

                                            // Always show last page if more than 1 page
                                            if (totalPages > 1) {
                                                items.push(totalPages);
                                            }

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
                                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(applications.length / itemsPerPage), prev + 1))}
                                                disabled={currentPage === Math.ceil(applications.length / itemsPerPage)}
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
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsRejectionModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Provide Feedback</h3>
                            <button onClick={() => setIsRejectionModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <ArrowLeft className="h-5 w-5 rotate-180" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">
                                Please provide a reason for rejection. This feedback will be shared with the candidate to help them improve.
                            </p>

                            <textarea
                                value={rejectionReason}
                                onChange={(e) => {
                                    setRejectionReason(e.target.value);
                                    setRejectionError(null);
                                }}
                                className={`w-full p-4 border rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${rejectionError ? 'border-red-500' : 'border-slate-200'
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
            {/* AI Scoring Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsConfirmModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 overflow-hidden">
                        <div className="text-center mb-6">
                            <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">AI Analysis & Ranking</h3>
                        </div>

                        <div className="space-y-4 mb-8">
                            <p className="text-slate-600 leading-relaxed text-center">
                                Our AI will now analyze and rank all <span className="font-bold text-slate-900">{applications.length}</span> applicants based on their resumes and qualifications.
                            </p>
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                <p className="text-sm text-amber-700">
                                    This process involves NLP analysis of each resume and <span className="font-semibold">may take a few minutes</span> depending on the number of applicants.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setIsConfirmModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                onClick={handleScoreAll}
                                disabled={isScoring}
                            >
                                {isScoring ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Ranking...
                                    </>
                                ) : (
                                    "Start AI Ranking"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
