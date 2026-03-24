'use client';

import { useState, useEffect } from 'react';
import {
    User, Mail, Phone, MapPin, GraduationCap,
    Briefcase, Loader2, Save, CheckCircle, AlertCircle,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { Button } from '@/components/Button';

interface FormData {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    educationLevel: string;
    yearsOfExperience: string;
}

export default function ProfilePage() {
    const qc = useQueryClient();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving]   = useState(false);
    const [message, setMessage]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        educationLevel: '',
        yearsOfExperience: '',
    });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/candidate/profile');
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setFormData({
                            fullName:          data.full_name ?? '',
                            email:             data.email ?? '',
                            phone:             data.phone ?? '',
                            address:           data.address ?? '',
                            educationLevel:    data.education_level ?? '',
                            yearsOfExperience: data.years_of_experience?.toString() ?? '',
                        });
                    }
                }
            } catch (err) {
                console.error('Error loading profile:', err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/candidate/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    yearsOfExperience: formData.yearsOfExperience ? parseFloat(formData.yearsOfExperience) : null,
                }),
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile saved successfully!' });
                qc.invalidateQueries({ queryKey: queryKeys.candidateProfile() });
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || 'Failed to save profile' });
            }
        } catch {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-2 md:p-3">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                    </div>
                    <p className="text-slate-500 text-sm ml-[52px]">
                        Keep your details up to date — they auto-fill when you apply for jobs.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
                            <p className="text-slate-500 font-medium">Loading your profile...</p>
                        </div>
                    ) : (
                        <form id="profile-form" onSubmit={handleSubmit} className="p-6 md:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Full Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <User className="h-4 w-4" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Mail className="h-4 w-4" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Phone className="h-4 w-4" /> Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>

                                {/* Years of Experience */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" /> Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        name="yearsOfExperience"
                                        value={formData.yearsOfExperience}
                                        onChange={handleChange}
                                        step="0.5"
                                        min="0"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="5"
                                    />
                                </div>

                                {/* Education Level */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4" /> Highest Education Level
                                    </label>
                                    <select
                                        name="educationLevel"
                                        value={formData.educationLevel}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm bg-white"
                                    >
                                        <option value="">Select level</option>
                                        <option value="bachelors">Bachelor's Degree</option>
                                        <option value="master">Master's Degree</option>
                                        <option value="phd">PhD</option>
                                        <option value="diploma">Diploma</option>
                                        <option value="highschool">High School</option>
                                    </select>
                                </div>

                                {/* Address */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                                        placeholder="123 Main St, City, Country"
                                    />
                                </div>
                            </div>

                            {message && (
                                <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                                    message.type === 'success'
                                        ? 'bg-green-50 text-green-700 border border-green-100'
                                        : 'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                    {message.type === 'success'
                                        ? <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                        : <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    }
                                    <p className="text-sm font-medium">{message.text}</p>
                                </div>
                            )}

                            <div className="mt-8 flex justify-end">
                                <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={isSaving}
                                    className="min-w-[140px]"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Profile
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
