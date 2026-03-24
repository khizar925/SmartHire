'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, FileText, Upload, Loader2, Sparkles, CheckCircle, AlertCircle, Briefcase, PenLine } from 'lucide-react';
import { Button } from './Button';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';

type JdMode = 'job' | 'custom';

interface Job {
    id: string;
    job_title: string;
    company_name: string;
}

interface ScoreResumeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

function getScoreFeedback(score: number): { heading: string; body: string } {
    if (score >= 80) return { heading: 'Excellent Match!', body: 'Your resume is a strong fit for this role.' };
    if (score >= 60) return { heading: 'Good Match', body: 'Your resume aligns well with this position.' };
    if (score >= 40) return { heading: 'Moderate Match', body: 'Your resume partially matches this role. Consider tailoring it further.' };
    return { heading: 'Low Match', body: 'Your resume may need significant updates for this role.' };
}

export function ScoreResumeModal({ isOpen, onClose }: ScoreResumeModalProps) {
    const [mounted, setMounted] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [jdMode, setJdMode] = useState<JdMode>('job');
    const [selectedJobId, setSelectedJobId] = useState('');
    const [selectedJobLabel, setSelectedJobLabel] = useState('');
    const [jobSearch, setJobSearch] = useState('');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [showJobList, setShowJobList] = useState(false);
    const [customJd, setCustomJd] = useState('');
    const [isScoring, setIsScoring] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const jobListRef = useRef<HTMLDivElement>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            resetForm();
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    function resetForm() {
        setFile(null);
        setScore(null);
        setError(null);
        setJdMode('job');
        setSelectedJobId('');
        setSelectedJobLabel('');
        setJobSearch('');
        setCustomJd('');
        setJobs([]);
        setShowJobList(false);
    }

    const searchJobs = useCallback((query: string) => {
        clearTimeout(searchTimeout.current);
        setJobsLoading(true);
        searchTimeout.current = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ limit: '20' });
                if (query.trim()) params.set('search', query.trim());
                const res = await fetch(`/api/jobs/public?${params}`);
                const data = await res.json();
                setJobs(data.jobs || []);
            } catch {
                setJobs([]);
            } finally {
                setJobsLoading(false);
            }
        }, 300);
    }, []);

    useEffect(() => {
        if (jdMode === 'job' && showJobList) {
            searchJobs(jobSearch);
        }
    }, [jobSearch, jdMode, showJobList, searchJobs]);

    // Close job list on outside click
    useEffect(() => {
        if (!showJobList) return;
        function handle(e: MouseEvent) {
            if (
                jobListRef.current && !jobListRef.current.contains(e.target as Node) &&
                searchRef.current && !searchRef.current.contains(e.target as Node)
            ) {
                setShowJobList(false);
            }
        }
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [showJobList]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File exceeds 5 MB limit.');
            setFile(null);
            return;
        }
        const allowed = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ];
        if (!allowed.includes(selectedFile.type)) {
            setError('Please upload a PDF, DOCX, or TXT file.');
            setFile(null);
            return;
        }
        setFile(selectedFile);
        setError(null);
    };

    const canScore =
        !!file &&
        ((jdMode === 'job' && !!selectedJobId) ||
            (jdMode === 'custom' && customJd.trim().length >= 20));

    const handleCheckScore = async () => {
        if (!canScore) return;
        setIsScoring(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('resume', file!);
            if (jdMode === 'job') formData.append('jobId', selectedJobId);
            if (jdMode === 'custom') formData.append('customJd', customJd.trim());

            const res = await fetch('/api/score-resume', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to score resume. Please try again.');
                return;
            }
            setScore(Math.round(data.score));
        } catch {
            setError('Failed to score resume. Please try again.');
        } finally {
            setIsScoring(false);
        }
    };

    if (!isOpen || !mounted) return null;

    const feedback = score !== null ? getScoreFeedback(score) : null;

    const modalContent = (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="relative z-[1000] w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] mt-auto sm:mt-0"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-600/20">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 font-serif tracking-tight">Score My Resume</h2>
                            <p className="text-xs text-slate-500 font-medium">Get instant AI-powered feedback on your resume</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 overflow-y-auto">
                    {score === null ? (
                        <>
                            {/* Upload Area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${file ? 'border-primary-500 bg-primary-50/30' : 'border-slate-200 hover:border-primary-400 hover:bg-slate-50'}`}
                            >
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.txt" />
                                <div className={`p-3 rounded-full ${file ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {file ? <FileText className="h-7 w-7" /> : <Upload className="h-7 w-7" />}
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-900">{file ? file.name : 'Click to upload resume'}</p>
                                    <p className="text-sm text-slate-500 mt-0.5">Supports PDF, DOCX, and TXT (Max 5MB)</p>
                                </div>
                            </div>

                            {/* JD Mode Selector */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Score against</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {([
                                        { mode: 'job' as JdMode, icon: Briefcase, label: 'Existing Job', desc: 'Match against a live job posting' },
                                        { mode: 'custom' as JdMode, icon: PenLine, label: 'Custom JD', desc: 'Paste any job description' },
                                    ]).map(({ mode, icon: Icon, label, desc }) => (
                                        <button
                                            key={mode}
                                            onClick={() => {
                                                setJdMode(mode);
                                                setSelectedJobId('');
                                                setSelectedJobLabel('');
                                                setJobSearch('');
                                                setShowJobList(false);
                                            }}
                                            className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${jdMode === mode ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                        >
                                            <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${jdMode === mode ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-semibold ${jdMode === mode ? 'text-primary-700' : 'text-slate-700'}`}>{label}</p>
                                                <p className="text-xs text-slate-400 mt-0.5 leading-snug">{desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Job search (mode: job) */}
                            {jdMode === 'job' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-slate-400" />
                                        Search for a job
                                    </label>
                                    {selectedJobId ? (
                                        <div className="flex items-center justify-between px-4 py-3 border-2 border-primary-500 bg-primary-50 rounded-xl">
                                            <span className="text-sm font-medium text-primary-800 truncate">{selectedJobLabel}</span>
                                            <button
                                                onClick={() => { setSelectedJobId(''); setSelectedJobLabel(''); setJobSearch(''); }}
                                                className="ml-2 text-primary-500 hover:text-primary-700 flex-shrink-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                ref={searchRef}
                                                type="text"
                                                value={jobSearch}
                                                onChange={e => setJobSearch(e.target.value)}
                                                onFocus={() => { setShowJobList(true); if (!jobs.length) searchJobs(jobSearch); }}
                                                placeholder="Search by title or company..."
                                                className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                            {showJobList && (
                                                <div
                                                    ref={jobListRef}
                                                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto"
                                                >
                                                    {jobsLoading ? (
                                                        <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
                                                            <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                                                        </div>
                                                    ) : jobs.length === 0 ? (
                                                        <div className="px-4 py-3 text-sm text-slate-400">No jobs found</div>
                                                    ) : (
                                                        jobs.map(job => (
                                                            <button
                                                                key={job.id}
                                                                onClick={() => {
                                                                    setSelectedJobId(job.id);
                                                                    setSelectedJobLabel(`${job.job_title} — ${job.company_name}`);
                                                                    setShowJobList(false);
                                                                }}
                                                                className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                                                            >
                                                                <span className="font-medium text-slate-900">{job.job_title}</span>
                                                                <span className="text-slate-500"> — {job.company_name}</span>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Custom JD textarea (mode: custom) */}
                            {jdMode === 'custom' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <PenLine className="h-4 w-4 text-slate-400" />
                                        Paste job description
                                    </label>
                                    <textarea
                                        value={customJd}
                                        onChange={e => setCustomJd(e.target.value)}
                                        placeholder="Paste the full job description here..."
                                        rows={5}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                    />
                                    {customJd.trim().length > 0 && customJd.trim().length < 20 && (
                                        <p className="text-xs text-amber-600">Please enter at least 20 characters</p>
                                    )}
                                </div>
                            )}

                            {error && (
                                <div className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={handleCheckScore}
                                disabled={!canScore || isScoring}
                                variant="primary"
                                className="w-full h-12 text-base font-bold shadow-lg shadow-primary-600/20"
                            >
                                {isScoring ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing Resume...</>
                                ) : (
                                    <>Check Score <Sparkles className="ml-2 h-4 w-4" /></>
                                )}
                            </Button>
                        </>
                    ) : (
                        /* Result View */
                        <div className="flex flex-col items-center py-6 text-center animate-in fade-in zoom-in duration-500">
                            <div className="relative mb-6">
                                <svg className="h-32 w-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                                    <circle
                                        cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                                        strokeDasharray={364.4}
                                        strokeDashoffset={364.4 - (364.4 * score) / 100}
                                        className="text-primary-600 transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-slate-900 font-serif">{score}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-center gap-2 text-primary-700 bg-primary-50 px-3 py-1 rounded-full text-sm font-bold">
                                    <CheckCircle className="h-4 w-4" />
                                    AI Score Assigned
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 font-serif">{feedback!.heading}</h3>
                                <p className="text-slate-500 max-w-xs mx-auto">{feedback!.body}</p>
                            </div>

                            <Button onClick={resetForm} variant="secondary" className="mt-8 w-full font-bold">
                                Score Another Resume
                            </Button>
                        </div>
                    )}
                </div>

                {score === null && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center flex-shrink-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure • Private • AI-Powered</p>
                    </div>
                )}
            </motion.div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
