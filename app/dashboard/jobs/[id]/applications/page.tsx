'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Users, Mail, Phone, GraduationCap,
    Award, FileText, Calendar, Loader2, AlertCircle,
    ExternalLink, User
} from 'lucide-react';
import { Button } from '@/components/Button';

interface Application {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    education_level: string;
    years_of_experience: number;
    cover_letter: string;
    resume_url: string;
    status: string;
    created_at: string;
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
                        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-3">
                            <Users className="h-5 w-5 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-700">
                                {applications.length} {applications.length === 1 ? 'Applicant' : 'Applicants'}
                            </span>
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
                    <div className="grid gap-6">
                        {applications.map((app) => (
                            <div key={app.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">
                                    {/* Basic Info & Contact */}
                                    <div className="lg:w-1/3 space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="h-14 w-14 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                <User className="h-8 w-8 text-primary-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900 mb-1">{app.full_name}</h2>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                                                    New Applicant
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-slate-600 group">
                                                <Mail className="h-4 w-4" />
                                                <a href={`mailto:${app.email}`} className="text-sm hover:text-primary-600 transition-colors">{app.email}</a>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <Phone className="h-4 w-4" />
                                                <span className="text-sm">{app.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-600">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-sm">Applied on {formatDate(app.created_at)}</span>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 flex gap-3">
                                            <a
                                                href={app.resume_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-sm"
                                            >
                                                <FileText className="h-4 w-4" />
                                                View Resume
                                            </a>
                                        </div>
                                    </div>

                                    {/* Qualifications & Cover Letter */}
                                    <div className="lg:w-2/3 space-y-6">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Education Level</p>
                                                    <p className="font-bold text-slate-700 capitalize">{app.education_level}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <Award className="h-5 w-5 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Experience</p>
                                                    <p className="font-bold text-slate-700">{app.years_of_experience} Years</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 relative group">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                Cover Letter
                                            </h3>
                                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                {app.cover_letter}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
