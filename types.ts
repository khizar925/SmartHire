import { ReactNode } from 'react';

export interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  company: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Job {
  id: string;
  recruiter_id: string;
  job_title: string;
  company_name: string;
  company_linkedin_url?: string | null;
  workplace_type: 'On-site' | 'Hybrid' | 'Remote';
  job_location: string;
  employment_type: string;
  job_description: string;
  skills: string[];
  industry: string;
  job_function: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  status: 'active' | 'closed';
  expiry_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobPostingFormData {
  job_title: string;
  company_name: string;
  company_linkedin_url?: string;
  workplace_type: 'On-site' | 'Hybrid' | 'Remote';
  job_location: string;
  employment_type: string;
  job_description: string;
  skills: string[];
  industry: string;
  job_function: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  expiry_date?: string;
}

export interface RecruiterJob extends Job {
  // Same as Job, but used for clarity in recruiter context
}

export type UserRole = "candidate" | "recruiter";