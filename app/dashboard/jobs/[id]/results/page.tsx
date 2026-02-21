'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Award, Search, Filter, ArrowUpDown
    , GraduationCap, Briefcase, FileText,
    ExternalLink, User, Loader2, AlertCircle, RefreshCw
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

interface Score {
    score: number;
}

interface Application {
    id: string;
    full_name: string;
    email: string;
    education_level: string;
    years_of_experience: number;
    resume_url: string;
    scores?: Score[];
}

interface Job {
    id: string;
    job_title: string;
    company_name: string;
}

export default function JobResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter/Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [educationFilter, setEducationFilter] = useState<string>('all');

    const [sortConfigs, setSortConfigs] = useState<{ key: 'score' | 'experience', order: 'asc' | 'desc' }[]>([]);

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

            // Fetch Applications with scores
            const appRes = await fetch(`/api/application?jobId=${id}`);
            const appData = await appRes.json();

            if (appRes.ok) {
                // Filter out applications that don't have scores yet
                setApplications(appData.applications || []);
            } else {
                setError(appData.error || 'Failed to load results');
            }
        } catch (err) {
            setError('An error occurred while fetching data');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAndSortedApplications = useMemo(() => {
        let result = [...applications].filter(app => {
            const matchesSearch = app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesEducation = educationFilter === 'all' ||
                app.education_level.toLowerCase() === educationFilter.toLowerCase();
            return matchesSearch && matchesEducation;
        });

        if (sortConfigs.length > 0) {
            result.sort((a, b) => {
                for (const config of sortConfigs) {
                    let comparison = 0;
                    if (config.key === 'score') {
                        const scoreA = a.scores?.[0]?.score || 0;
                        const scoreB = b.scores?.[0]?.score || 0;
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

    const toggleSort = (key: 'score' | 'experience') => {
        setSortConfigs(prev => {
            const existingIndex = prev.findIndex(c => c.key === key);

            if (existingIndex === -1) {
                // Not in sort, add as secondary (or primary if none exists) with desc order
                return [...prev, { key, order: 'desc' }];
            } else {
                const existing = prev[existingIndex];
                if (existing.order === 'desc') {
                    // Switch to asc
                    const newConfigs = [...prev];
                    newConfigs[existingIndex] = { ...existing, order: 'asc' };
                    return newConfigs;
                } else {
                    // Remove from sort
                    return prev.filter(c => c.key !== key);
                }
            }
        });
    };

    const uniqueEducationLevels = useMemo(() => {
        const levels = applications.map(app => app.education_level);
        return Array.from(new Set(levels)).filter(Boolean).sort();
    }, [applications]);

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
                        Back to Applications
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2 font-display">AI Analysis Results</h1>
                            {job && (
                                <p className="text-lg text-slate-600">
                                    Top candidates ranked by AI for <span className="font-semibold text-primary-600">{job.job_title}</span>
                                </p>
                            )}
                        </div>
                        <Button
                            onClick={fetchData}
                            variant="outline"
                            className="bg-white border-slate-200 text-slate-600 hover:text-slate-900"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh Results
                        </Button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <select
                            value={educationFilter}
                            onChange={(e) => {
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

                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 flex-1">
                            <button
                                onClick={() => toggleSort('score')}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${sortConfigs.some(c => c.key === 'score')
                                    ? 'bg-white shadow-sm text-primary-600 border border-slate-100'
                                    : 'text-slate-500 hover:bg-white/50'
                                    }`}
                            >
                                <Award className="h-3 w-3" />
                                {sortConfigs.find(c => c.key === 'score')?.order === 'asc' ? '↑' :
                                    sortConfigs.find(c => c.key === 'score')?.order === 'desc' ? '↓' : ''} Score
                            </button>
                            <button
                                onClick={() => toggleSort('experience')}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${sortConfigs.some(c => c.key === 'experience')
                                    ? 'bg-white shadow-sm text-primary-600 border border-slate-100'
                                    : 'text-slate-500 hover:bg-white/50'
                                    }`}
                            >
                                <Briefcase className="h-3 w-3" />
                                {sortConfigs.find(c => c.key === 'experience')?.order === 'asc' ? '↑' :
                                    sortConfigs.find(c => c.key === 'experience')?.order === 'desc' ? '↓' : ''} Exp.
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border border-slate-200">
                        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
                        <p className="text-slate-500 font-medium">Loading analysis results...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 p-8 rounded-2xl text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-red-900 mb-2">Error Loading Results</h3>
                        <p className="text-red-700 mb-6">{error}</p>
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
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Score</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Experience</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Education</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredAndSortedApplications
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map((app, appIndex) => {
                                                const index = (currentPage - 1) * itemsPerPage + appIndex;
                                                const scoreValue = app.scores?.[0]?.score || 0;
                                                return (
                                                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${index === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                                index === 1 ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                                                                    index === 2 ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                                                        'bg-white text-slate-400 border border-slate-100'
                                                                }`}>
                                                                {index + 1}
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
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-lg">
                                                                    {scoreValue.toFixed(1)}
                                                                </div>
                                                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-indigo-500 transition-all duration-1000"
                                                                        style={{ width: `${scoreValue}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2 text-slate-700">
                                                                <Briefcase className="h-4 w-4 text-slate-400" />
                                                                <span className="font-medium">{app.years_of_experience} Years</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2 text-slate-700">
                                                                <GraduationCap className="h-4 w-4 text-slate-400" />
                                                                <span className="font-medium">{app.education_level}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <a
                                                                href={app.resume_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                                                            >
                                                                <FileText className="h-3 w-3" />
                                                                Resume
                                                            </a>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {filteredAndSortedApplications.length > itemsPerPage && (
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
                                            const totalPages = Math.ceil(filteredAndSortedApplications.length / itemsPerPage);
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
                                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredAndSortedApplications.length / itemsPerPage), prev + 1))}
                                                disabled={currentPage === Math.ceil(filteredAndSortedApplications.length / itemsPerPage)}
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
