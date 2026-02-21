// app/jobs/[id]/page.tsx

'use client';
import { use, useState, useEffect } from 'react';
import { Loader2, AlertCircle, MapPin, Clock, Briefcase, Upload, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/Button';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = {
    params: Promise<{ id: string }>
}

type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'temporary';

type JobData = {
    id: string,
    recruiter_id: string,
    job_title: string,
    job_location: string,
    employment_type: EmploymentType,
    job_description: string,
    status: string,
    company_name: string
}

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

export default function JobPage({ params }: Props) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const router = useRouter();
    const apply = searchParams.get('apply');
    const { userId } = useAuth();
    const [jobData, setJobData] = useState<JobData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasApplied, setHasApplied] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

    useEffect(() => {
        if (userId && id) {
            checkApplicationStatus();
        }
    }, [userId, id]);

    const checkApplicationStatus = async () => {
        try {
            const res = await fetch(`/api/application?jobId=${id}&check=true`);
            const data = await res.json();
            if (data.hasApplied) {
                setHasApplied(true);
                setApplicationStatus(data.application?.status || 'pending');
            }
        } catch (e) {
            console.error('Error checking application status:', e);
        }
    };
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<ApplicationFormData>({
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
        educationLevel: '',
        yearsOfExperience: '',
        coverLetter: '',
        resume: null,
    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'application'>('overview');

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/jobs/public/${id}`);

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to load job details');
                setIsLoading(false);
                return;
            }

            const data = await response.json();
            setJobData(data);
        }
        catch (err) {
            setError('Failed to load job details. Please try again later.');
        }
        finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [id]);

    useEffect(() => {
        if (apply === 'true') {
            setActiveTab('application');
        }
    }, [apply]);

    // Auto-clear submit message
    useEffect(() => {
        if (submitMessage) {
            const timer = setTimeout(() => {
                setSubmitMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [submitMessage]);


    const formatEmploymentType = (type: EmploymentType) => {
        return type.replace('-', ' ').split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    // Validation functions
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhoneNumber = (phone: string): boolean => {
        const phoneRegex = /^[0-9]{7,15}$/;
        return phoneRegex.test(phone.replace(/\s+/g, ''));
    };

    const validateFile = (file: File | null): string | null => {
        if (!file) return 'Resume/CV is required';

        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            return 'Please upload a PDF, DOC, or DOCX file';
        }

        if (file.size > maxSize) {
            return 'File size must be less than 5MB';
        }

        return null;
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required';
        } else if (!validatePhoneNumber(formData.phoneNumber)) {
            errors.phoneNumber = 'Please enter a valid phone number (7-15 digits)';
        }

        if (!formData.address.trim()) {
            errors.address = 'Address is required';
        }

        if (!formData.educationLevel) {
            errors.educationLevel = 'Education level is required';
        }

        if (!formData.yearsOfExperience.trim()) {
            errors.yearsOfExperience = 'Years of experience is required';
        } else {
            const years = parseFloat(formData.yearsOfExperience);
            if (isNaN(years) || years < 0) {
                errors.yearsOfExperience = 'Please enter a valid number (0 or greater)';
            }
        }

        if (!formData.coverLetter.trim()) {
            errors.coverLetter = 'Cover letter is required';
        }

        const fileError = validateFile(formData.resume);
        if (fileError) {
            errors.resume = fileError;
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field when user starts typing
        if (formErrors[name as keyof FormErrors]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({ ...prev, resume: file }));

        // Clear error when file is selected
        if (formErrors.resume) {
            setFormErrors(prev => ({ ...prev, resume: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitMessage(null);

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const submitData = new FormData();
            submitData.append('jobId', id);
            submitData.append('name', formData.name);
            submitData.append('email', formData.email);
            submitData.append('phoneNumber', formData.phoneNumber);
            submitData.append('address', formData.address);
            submitData.append('educationLevel', formData.educationLevel);
            submitData.append('yearsOfExperience', formData.yearsOfExperience);
            submitData.append('coverLetter', formData.coverLetter);
            if (formData.resume) {
                submitData.append('resume', formData.resume);
            }

            const response = await fetch('/api/application', {
                method: 'POST',
                body: submitData,
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitMessage({
                    type: 'success',
                    text: 'Your application has been submitted successfully! The recruiter will review it soon.'
                });

                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            } else {
                setSubmitMessage({
                    type: 'error',
                    text: result.error || 'Failed to submit application. Please try again.'
                });
            }
        } catch (err) {
            setSubmitMessage({
                type: 'error',
                text: 'An unexpected error occurred. Please check your connection and try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading State
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

    // Error State
    if (error || !jobData) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 max-w-md w-full">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-900 mb-1">
                                {error || 'Job not found'}
                            </p>
                            <p className="text-sm text-red-700 mb-4">
                                {error || 'The job you are looking for does not exist or has been removed.'}
                            </p>
                            <button
                                onClick={fetchData}
                                className="text-sm text-primary-600 hover:text-primary-700 underline font-medium"
                            >
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
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
                    <div className="flex flex-wrap items-start gap-3 mb-4">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${jobData.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-700'
                                }`}
                        >
                            {jobData.status === 'active' ? 'Active' : 'Closed'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700 flex-shrink-0">
                            {formatEmploymentType(jobData.employment_type)}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex-1">
                            {jobData.job_title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 mb-6">
                        <p className="text-lg text-slate-700 font-medium">
                            Company: {jobData.company_name}
                        </p>
                    </div>

                    {/* Details Section */}
                    <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <MapPin className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
                                    Location
                                </p>
                                <p className="text-sm font-medium text-slate-900">
                                    {jobData.job_location}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Clock className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
                                    Employment Type
                                </p>
                                <p className="text-sm font-medium text-slate-900">
                                    {formatEmploymentType(jobData.employment_type)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
                    <div className="flex border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`flex-1 py-4 text-center text-sm font-semibold transition-colors duration-200
                                ${activeTab === 'overview'
                                    ? 'text-primary-600 border-b-2 border-primary-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('application')}
                            className={`flex-1 py-4 text-center text-sm font-semibold transition-colors duration-200
                                ${activeTab === 'application'
                                    ? 'text-primary-600 border-b-2 border-primary-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Application
                        </button>
                    </div>
                </div>

                {/* Description Section */}
                {activeTab === 'overview' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Job Description</h2>
                        <div className="prose prose-slate max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {jobData.job_description}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}

                {/* Apply Form */}
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
                                    <span className={`block mt-2 text-lg font-bold uppercase tracking-wider ${applicationStatus === 'rejected' ? 'text-red-600' :
                                        applicationStatus === 'shortlisted' ? 'text-green-600' :
                                            'text-primary-600'
                                        }`}>
                                        {applicationStatus}
                                    </span>
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Button variant="primary" onClick={() => router.push('/dashboard')}>
                                        View All Applications
                                    </Button>
                                    <Button variant="secondary" onClick={() => setActiveTab('overview')}>
                                        Return to Job Overview
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Apply for this Position</h2>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.name ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                            placeholder="Enter your full name"
                                        />
                                        {formErrors.name && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.email ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                            placeholder="Enter your email address"
                                        />
                                        {formErrors.email && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                                        )}
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-900 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.phoneNumber ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                            placeholder="Enter your phone number"
                                        />
                                        {formErrors.phoneNumber && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                                        )}
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-semibold text-slate-900 mb-2">
                                            Address *
                                        </label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${formErrors.address ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                            placeholder="Enter your address"
                                        />
                                        {formErrors.address && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                                        )}
                                    </div>

                                    {/* Education Level */}
                                    <div>
                                        <label htmlFor="educationLevel" className="block text-sm font-semibold text-slate-900 mb-2">
                                            Education Level *
                                        </label>
                                        <select
                                            id="educationLevel"
                                            name="educationLevel"
                                            value={formData.educationLevel}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.educationLevel ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                        >
                                            <option value="">Select education level</option>
                                            <option value="bachelors">Bachelor's Degree</option>
                                            <option value="master">Master's Degree</option>
                                            <option value="phd">PhD</option>
                                        </select>
                                        {formErrors.educationLevel && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.educationLevel}</p>
                                        )}
                                    </div>

                                    {/* Years of Experience */}
                                    <div>
                                        <label htmlFor="yearsOfExperience" className="block text-sm font-semibold text-slate-900 mb-2">
                                            Years of Experience in Relevant Field *
                                        </label>
                                        <input
                                            type="number"
                                            id="yearsOfExperience"
                                            name="yearsOfExperience"
                                            value={formData.yearsOfExperience}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.5"
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.yearsOfExperience ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                            placeholder="Enter years of experience"
                                        />
                                        {formErrors.yearsOfExperience && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.yearsOfExperience}</p>
                                        )}
                                    </div>

                                    {/* Cover Letter */}
                                    <div>
                                        <label htmlFor="coverLetter" className="block text-sm font-semibold text-slate-900 mb-2">
                                            Cover Letter *
                                        </label>
                                        <textarea
                                            id="coverLetter"
                                            name="coverLetter"
                                            value={formData.coverLetter}
                                            onChange={handleInputChange}
                                            rows={6}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${formErrors.coverLetter ? 'border-red-300' : 'border-slate-300'
                                                }`}
                                            placeholder="Write your cover letter here..."
                                        />
                                        {formErrors.coverLetter && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.coverLetter}</p>
                                        )}
                                    </div>

                                    {/* Resume/CV */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Resume/CV *
                                        </label>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="resume"
                                                className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${formErrors.resume
                                                    ? 'border-red-300 bg-red-50 hover:bg-red-100'
                                                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                                                    }`}
                                            >
                                                <Upload className="h-5 w-5 text-slate-600" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {formData.resume ? formData.resume.name : 'Choose file or drag and drop'}
                                                </span>
                                            </label>
                                            <input
                                                type="file"
                                                id="resume"
                                                name="resume"
                                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            {formData.resume && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <span>Selected: {formData.resume.name}</span>
                                                    <span className="text-slate-400">
                                                        ({(formData.resume.size / 1024 / 1024).toFixed(2)} MB)
                                                    </span>
                                                </div>
                                            )}
                                            <p className="text-xs text-slate-500">
                                                Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
                                            </p>
                                        </div>
                                        {formErrors.resume && (
                                            <p className="mt-1 text-sm text-red-600">{formErrors.resume}</p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4 flex justify-center">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            disabled={isSubmitting || jobData?.status !== 'active'}
                                            className="w-full sm:w-auto"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit Application'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Floating Toast Notification */}
            <AnimatePresence>
                {submitMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="fixed bottom-6 right-6 z-[100] max-w-sm w-full"
                    >
                        <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 ${submitMessage.type === 'success'
                            ? 'bg-white border-green-100'
                            : 'bg-white border-red-100'
                            }`}>
                            <div className={`p-2 rounded-lg flex-shrink-0 ${submitMessage.type === 'success' ? 'bg-green-50' : 'bg-red-50'
                                }`}>
                                {submitMessage.type === 'success' ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                )}
                            </div>
                            <div className="flex-1 pt-0.5">
                                <p className={`text-sm font-bold ${submitMessage.type === 'success' ? 'text-green-900' : 'text-red-900'
                                    }`}>
                                    {submitMessage.type === 'success' ? 'Success!' : 'System Error'}
                                </p>
                                <p className="text-sm text-slate-600 mt-1">
                                    {submitMessage.text}
                                </p>
                            </div>
                            <button
                                onClick={() => setSubmitMessage(null)}
                                className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                            >
                                <X className="h-4 w-4 text-slate-400" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}