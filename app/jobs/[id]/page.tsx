// app/jobs/[id]/page.tsx
'use client';

import { use, useState, useEffect } from 'react';
import { Loader2, AlertCircle, MapPin, Clock, Upload, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/Button';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { usePublicJob } from '@/lib/queries/jobs';
import { useApplicationCheck } from '@/lib/queries/applications';
import { useCandidateProfile } from '@/lib/queries/candidate';
import { useSubmitApplication } from '@/lib/mutations/applications';

type Props = { params: Promise<{ id: string }> }

type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'temporary';
type EducationLevel = 'Bachelors' | 'Master' | 'PHD' | '';

type ApplicationFormData = {
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    educationLevel: EducationLevel;
    yearsOfExperience: string;
    coverLetter: string;
    resume: File | null;
}

type FormErrors = {
    name?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    educationLevel?: string;
    yearsOfExperience?: string;
    coverLetter?: string;
    resume?: string;
}

const EMPTY_FORM: ApplicationFormData = {
    name: '', email: '', phoneNumber: '', address: '',
    educationLevel: '', yearsOfExperience: '', coverLetter: '', resume: null,
};

export default function JobPage({ params }: Props) {
    const { id }       = use(params);
    const searchParams = useSearchParams();
    const router       = useRouter();
    const { userId }   = useAuth();

    const [activeTab,    setActiveTab]    = useState<'overview' | 'application'>('overview');
    const [formData,     setFormData]     = useState<ApplicationFormData>(EMPTY_FORM);
    const [formErrors,   setFormErrors]   = useState<FormErrors>({});
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // ── Queries ────────────────────────────────────────────────────────────────
    const { data: jobData, isLoading, error, refetch } = usePublicJob(id);
    const { data: appCheck } = useApplicationCheck(id, userId);
    const { data: profile }  = useCandidateProfile(userId);

    const hasApplied       = appCheck?.hasApplied ?? false;
    const applicationStatus = appCheck?.application?.status ?? null;

    // ── Mutations ──────────────────────────────────────────────────────────────
    const submit = useSubmitApplication(id);

    // Auto-open application tab from URL param
    useEffect(() => {
        if (searchParams.get('apply') === 'true') setActiveTab('application');
    }, [searchParams]);

    // Pre-fill form from cached profile when application tab is opened
    useEffect(() => {
        if (userId && activeTab === 'application' && profile) {
            setFormData(prev => ({
                ...prev,
                name:              profile.full_name           || prev.name,
                email:             profile.email               || prev.email,
                phoneNumber:       profile.phone               || prev.phoneNumber,
                address:           profile.address             || prev.address,
                educationLevel:    (profile.education_level as EducationLevel) || prev.educationLevel,
                yearsOfExperience: profile.years_of_experience?.toString() || prev.yearsOfExperience,
            }));
        }
    }, [userId, activeTab, profile]);

    // Auto-clear toast
    useEffect(() => {
        if (!submitMessage) return;
        const t = setTimeout(() => setSubmitMessage(null), 5000);
        return () => clearTimeout(t);
    }, [submitMessage]);

    // ── Helpers ────────────────────────────────────────────────────────────────
    const formatEmploymentType = (type: EmploymentType) =>
        type.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone: string) => /^[0-9]{7,15}$/.test(phone.replace(/\s+/g, ''));

    const validateFile = (file: File | null): string | null => {
        if (!file) return 'Resume/CV is required';
        const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowed.includes(file.type)) return 'Please upload a PDF, DOC, or DOCX file';
        if (file.size > 5 * 1024 * 1024) return 'File size must be less than 5MB';
        return null;
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};
        if (!formData.name.trim())               errors.name = 'Name is required';
        if (!formData.email.trim())              errors.email = 'Email is required';
        else if (!validateEmail(formData.email)) errors.email = 'Please enter a valid email address';
        if (!formData.phoneNumber.trim())               errors.phoneNumber = 'Phone number is required';
        else if (!validatePhone(formData.phoneNumber))  errors.phoneNumber = 'Please enter a valid phone number (7-15 digits)';
        if (!formData.address.trim())            errors.address = 'Address is required';
        if (!formData.educationLevel)            errors.educationLevel = 'Education level is required';
        if (!formData.yearsOfExperience.trim())  errors.yearsOfExperience = 'Years of experience is required';
        else {
            const y = parseFloat(formData.yearsOfExperience);
            if (isNaN(y) || y < 0) errors.yearsOfExperience = 'Please enter a valid number (0 or greater)';
        }
        if (!formData.coverLetter.trim()) errors.coverLetter = 'Cover letter is required';
        const fileErr = validateFile(formData.resume);
        if (fileErr) errors.resume = fileErr;
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name as keyof FormErrors]) setFormErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({ ...prev, resume: file }));
        if (formErrors.resume) setFormErrors(prev => ({ ...prev, resume: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitMessage(null);
        if (!validateForm()) return;

        const fd = new FormData();
        fd.append('jobId', id);
        fd.append('name', formData.name);
        fd.append('email', formData.email);
        fd.append('phoneNumber', formData.phoneNumber);
        fd.append('address', formData.address);
        fd.append('educationLevel', formData.educationLevel);
        fd.append('yearsOfExperience', formData.yearsOfExperience);
        fd.append('coverLetter', formData.coverLetter);
        if (formData.resume) fd.append('resume', formData.resume);

        try {
            await submit.mutateAsync(fd);
            setSubmitMessage({ type: 'success', text: 'Your application has been submitted successfully! The recruiter will review it soon.' });
            setTimeout(() => router.push('/dashboard/applications'), 2000);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to submit application. Please try again.';
            setSubmitMessage({ type: 'error', text: msg });
        }
    };

    // ── States ─────────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                    <p className="text-slate-600">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (error || !jobData) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 max-w-md w-full">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-900 mb-1">
                                {error?.message || 'Job not found'}
                            </p>
                            <p className="text-sm text-red-700 mb-4">
                                The job you are looking for does not exist or has been removed.
                            </p>
                            <button onClick={() => refetch()} className="text-sm text-primary-600 hover:text-primary-700 underline font-medium">
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
                    <div className="flex flex-wrap items-start gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${jobData.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                            {jobData.status === 'active' ? 'Active' : 'Closed'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 flex-shrink-0">
                            {formatEmploymentType(jobData.employment_type as EmploymentType)}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{jobData.job_title}</h1>
                    <p className="text-lg text-slate-700 font-medium mb-6">Company: {jobData.company_name}</p>
                    <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg"><MapPin className="h-5 w-5 text-slate-600" /></div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Location</p>
                                <p className="text-sm font-medium text-slate-900">{jobData.job_location}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg"><Clock className="h-5 w-5 text-slate-600" /></div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Employment Type</p>
                                <p className="text-sm font-medium text-slate-900">{formatEmploymentType(jobData.employment_type as EmploymentType)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
                    <div className="flex border-b border-slate-200">
                        {(['overview', 'application'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 text-center text-sm font-semibold transition-colors duration-200 capitalize ${activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Overview */}
                {activeTab === 'overview' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Job Description</h2>
                        <div className="prose prose-slate max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{jobData.job_description}</ReactMarkdown>
                        </div>
                    </div>
                )}

                {/* Application */}
                {activeTab === 'application' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
                        {hasApplied ? (
                            <div className="text-center py-12">
                                <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Application Already Submitted</h3>
                                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                                    You have already applied for this position. Your current application status is:
                                    <span className={`block mt-2 text-lg font-bold uppercase tracking-wider ${applicationStatus === 'rejected' ? 'text-red-600' : applicationStatus === 'shortlisted' ? 'text-green-600' : 'text-primary-600'}`}>
                                        {applicationStatus}
                                    </span>
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Button variant="primary" onClick={() => router.push('/dashboard/applications')}>View All Applications</Button>
                                    <Button variant="secondary" onClick={() => setActiveTab('overview')}>Return to Job Overview</Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Apply for this Position</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">Name *</label>
                                        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.name ? 'border-red-300' : 'border-slate-300'}`}
                                            placeholder="Enter your full name" />
                                        {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">Email *</label>
                                        <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.email ? 'border-red-300' : 'border-slate-300'}`}
                                            placeholder="Enter your email address" />
                                        {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-900 mb-2">Phone Number *</label>
                                        <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.phoneNumber ? 'border-red-300' : 'border-slate-300'}`}
                                            placeholder="Enter your phone number" />
                                        {formErrors.phoneNumber && <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>}
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-semibold text-slate-900 mb-2">Address *</label>
                                        <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} rows={3}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${formErrors.address ? 'border-red-300' : 'border-slate-300'}`}
                                            placeholder="Enter your address" />
                                        {formErrors.address && <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>}
                                    </div>

                                    {/* Education Level */}
                                    <div>
                                        <label htmlFor="educationLevel" className="block text-sm font-semibold text-slate-900 mb-2">Education Level *</label>
                                        <select id="educationLevel" name="educationLevel" value={formData.educationLevel} onChange={handleInputChange}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.educationLevel ? 'border-red-300' : 'border-slate-300'}`}>
                                            <option value="">Select education level</option>
                                            <option value="bachelors">Bachelor&apos;s Degree</option>
                                            <option value="master">Master&apos;s Degree</option>
                                            <option value="phd">PhD</option>
                                        </select>
                                        {formErrors.educationLevel && <p className="mt-1 text-sm text-red-600">{formErrors.educationLevel}</p>}
                                    </div>

                                    {/* Years of Experience */}
                                    <div>
                                        <label htmlFor="yearsOfExperience" className="block text-sm font-semibold text-slate-900 mb-2">Years of Experience in Relevant Field *</label>
                                        <input type="number" id="yearsOfExperience" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleInputChange}
                                            min="0" step="0.5"
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.yearsOfExperience ? 'border-red-300' : 'border-slate-300'}`}
                                            placeholder="Enter years of experience" />
                                        {formErrors.yearsOfExperience && <p className="mt-1 text-sm text-red-600">{formErrors.yearsOfExperience}</p>}
                                    </div>

                                    {/* Cover Letter */}
                                    <div>
                                        <label htmlFor="coverLetter" className="block text-sm font-semibold text-slate-900 mb-2">Cover Letter *</label>
                                        <textarea id="coverLetter" name="coverLetter" value={formData.coverLetter} onChange={handleInputChange} rows={6}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${formErrors.coverLetter ? 'border-red-300' : 'border-slate-300'}`}
                                            placeholder="Write your cover letter here..." />
                                        {formErrors.coverLetter && <p className="mt-1 text-sm text-red-600">{formErrors.coverLetter}</p>}
                                    </div>

                                    {/* Resume */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Resume/CV *</label>
                                        <div className="space-y-2">
                                            <label htmlFor="resume"
                                                className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${formErrors.resume ? 'border-red-300 bg-red-50 hover:bg-red-100' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                                                <Upload className="h-5 w-5 text-slate-600" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {formData.resume ? formData.resume.name : 'Choose file or drag and drop'}
                                                </span>
                                            </label>
                                            <input type="file" id="resume" name="resume"
                                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                onChange={handleFileChange} className="hidden" />
                                            {formData.resume && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <span>Selected: {formData.resume.name}</span>
                                                    <span className="text-slate-400">({(formData.resume.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                </div>
                                            )}
                                            <p className="text-xs text-slate-500">Accepted formats: PDF, DOC, DOCX (Max size: 5MB)</p>
                                        </div>
                                        {formErrors.resume && <p className="mt-1 text-sm text-red-600">{formErrors.resume}</p>}
                                    </div>

                                    <div className="pt-4 flex justify-center">
                                        <Button type="submit" variant="primary" size="lg"
                                            disabled={submit.isPending || jobData?.status !== 'active'}
                                            className="w-full sm:w-auto">
                                            {submit.isPending ? (
                                                <><Loader2 className="h-5 w-5 animate-spin mr-2" />Submitting...</>
                                            ) : 'Submit Application'}
                                        </Button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Toast */}
            <AnimatePresence>
                {submitMessage && (
                    <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="fixed bottom-6 right-6 z-[100] max-w-sm w-full">
                        <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 bg-white ${submitMessage.type === 'success' ? 'border-green-100' : 'border-red-100'}`}>
                            <div className={`p-2 rounded-lg flex-shrink-0 ${submitMessage.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                                {submitMessage.type === 'success'
                                    ? <CheckCircle className="h-5 w-5 text-green-600" />
                                    : <AlertCircle className="h-5 w-5 text-red-600" />}
                            </div>
                            <div className="flex-1 pt-0.5">
                                <p className={`text-sm font-bold ${submitMessage.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
                                    {submitMessage.type === 'success' ? 'Success!' : 'Error'}
                                </p>
                                <p className="text-sm text-slate-600 mt-1">{submitMessage.text}</p>
                            </div>
                            <button onClick={() => setSubmitMessage(null)} className="p-1 hover:bg-slate-100 rounded-md transition-colors">
                                <X className="h-4 w-4 text-slate-400" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
