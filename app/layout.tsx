import type { Metadata } from 'next';
import {
  ClerkProvider,
} from '@clerk/nextjs'
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Hire - AI-Powered Recruitment',
  description: 'An advanced, AI-powered recruitment management system built to automate and optimize the hiring process for everyone.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body className="bg-white text-slate-900 overflow-x-hidden selection:bg-primary-100 selection:text-primary-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

