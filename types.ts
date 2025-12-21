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

export type UserRole = "candidate" | "recruiter";

export interface Job {
  id: string;
  recruiter_id: string;
  job_title: string;
  company_name: string;
  job_location: string;
  employment_type: string;
  job_description: string;
  status: 'active' | 'closed';
  applicants_count: number;
  created_at: string;
  updated_at: string;
}