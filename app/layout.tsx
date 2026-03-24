import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import Providers from '@/components/Providers';
import './globals.css';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://smarthire.website';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'SmartHire — AI-Powered Recruitment',
    template: '%s | SmartHire',
  },
  description: 'AI-powered recruitment platform that automates hiring. Post jobs, score resumes with NLP, and find the best candidates faster.',
  openGraph: {
    type: 'website',
    siteName: 'SmartHire',
    title: 'SmartHire — AI-Powered Recruitment',
    description: 'AI-powered recruitment platform that automates hiring. Post jobs, score resumes with NLP, and find the best candidates faster.',
    url: APP_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SmartHire — AI-Powered Recruitment',
    description: 'AI-powered recruitment platform that automates hiring. Post jobs, score resumes with NLP, and find the best candidates faster.',
  },
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
          <Providers>{children}</Providers>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}

