'use client';

import { useState, useEffect, useRef } from 'react';
import { X, FileText, Upload, Loader2, Sparkles, CheckCircle, AlertCircle, Briefcase } from 'lucide-react';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

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
    const [selectedJobId, setSelectedJobId] = useState<string>('');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [isScoring, setIsScoring] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setFile(null);
            setScore(null);
            setError(null);
            setSelectedJobId('');
            setJobsLoading(true);
            fetch('/api/jobs/public?limit=50')
                .then(res => res.json())
                .then(data => setJobs(data.jobs || []))
                .catch(() => setError('Failed to load jobs. Please try again.'))
                .finally(() => setJobsLoading(false));
        } else {
            document.body.style.overflow = 'unset';
            setJobs([]);
            setSelectedJobId('');
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File exceeds 5 MB limit.');
                setFile(null);
                return;
            }
            if (selectedFile.type === 'application/pdf' ||
                selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                selectedFile.type === 'text/plain') {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Please upload a PDF, DOCX, or TXT file.');
                setFile(null);
            }
        }
    };

    const handleCheckScore = async () => {
        if (!file || !selectedJobId) return;

        setIsScoring(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('resume', file);
            formData.append('jobId', selectedJobId);

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
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-[1000] w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-600/20">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 font-serif tracking-tight">Score My Resume</h2>
                            <p className="text-xs text-slate-500 font-medium">Get instant AI-powered feedback on your resume</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {score === null ? (
                        <>
                            {/* Upload Area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer
                                    ${file ? 'border-primary-500 bg-primary-50/30' : 'border-slate-200 hover:border-primary-400 hover:bg-slate-50'}
                                `}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".pdf,.docx,.txt"
                                />
                                <div className={`p-4 rounded-full ${file ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {file ? <FileText className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-900">
                                        {file ? file.name : 'Click to upload resume'}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Supports PDF, DOCX, and TXT (Max 5MB)
                                    </p>
                                </div>
                            </div>

                            {/* Job Selector */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Briefcase className="h-4 w-4 text-slate-400" />
                                    Score against which job?
                                </label>
                                {jobsLoading ? (
                                    <div className="flex items-center gap-2 text-sm text-slate-400 h-11 px-4 border border-slate-200 rounded-xl bg-slate-50">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading jobs...
                                    </div>
                                ) : jobs.length === 0 ? (
                                    <div className="text-sm text-slate-400 h-11 px-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center">
                                        No active jobs available
                                    </div>
                                ) : (
                                    <select
                                        value={selectedJobId}
                                        onChange={e => setSelectedJobId(e.target.value)}
                                        className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    >
                                        <option value="">Select a job to score against</option>
                                        {jobs.map(job => (
                                            <option key={job.id} value={job.id}>
                                                {job.job_title} — {job.company_name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={handleCheckScore}
                                disabled={!file || !selectedJobId || isScoring || jobsLoading}
                                variant="primary"
                                className="w-full h-12 text-base font-bold shadow-lg shadow-primary-600/20"
                            >
                                {isScoring ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Analyzing Resume...
                                    </>
                                ) : (
                                    <>
                                        Check Score
                                        <Sparkles className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        /* Result View */
                        <div className="flex flex-col items-center py-6 text-center animate-in fade-in zoom-in duration-500">
                            <div className="relative mb-6">
                                <svg className="h-32 w-32 transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-slate-100"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
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
                                <p className="text-slate-500 max-w-xs mx-auto">
                                    {feedback!.body}
                                </p>
                            </div>

                            <Button
                                onClick={() => { setScore(null); setFile(null); setSelectedJobId(''); }}
                                variant="secondary"
                                className="mt-8 w-full font-bold"
                            >
                                Score Another Resume
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer (only shown in upload state) */}
                {score === null && (
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Secure • Private • AI-Powered
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
