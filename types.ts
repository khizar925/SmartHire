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