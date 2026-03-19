import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy – Smart Hire',
  description: 'How Smart Hire collects, uses, and protects your personal information.',
};

export default function PrivacyPolicy() {
  const lastUpdated = 'March 19, 2026';

  return (
    <div className="min-h-screen bg-white">
      {/* Simple header */}
      <header className="border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary-600 text-white p-2 rounded-xl">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 font-serif">Smart Hire</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-slate-900 font-serif mb-3">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-12">Last updated: {lastUpdated}</p>

        <div className="prose prose-slate max-w-none space-y-10">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
            <p className="text-slate-600 leading-relaxed">
              Smart Hire (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is an AI-powered recruitment management platform. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our platform at smarthire.website. By using Smart Hire, you agree to the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
            <h3 className="text-base font-semibold text-slate-800 mb-2">Account Information</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              When you create an account, we collect your name, email address, and authentication credentials through our authentication provider, Clerk. You may also sign in using Google OAuth, in which case we receive your public profile information from Google.
            </p>
            <h3 className="text-base font-semibold text-slate-800 mb-2">Candidate Information</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              When applying for jobs, candidates provide personal information including full name, email address, phone number, address, education level, years of experience, a cover letter, and a resume file (PDF, DOCX, or DOC). This information is stored to process your job applications.
            </p>
            <h3 className="text-base font-semibold text-slate-800 mb-2">Recruiter Information</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Recruiters provide job posting details including job title, company name, location, job description, and required skills.
            </p>
            <h3 className="text-base font-semibold text-slate-800 mb-2">Usage Data</h3>
            <p className="text-slate-600 leading-relaxed">
              We collect anonymised usage analytics through Vercel Analytics to understand how the platform is used and to improve our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-slate-600 space-y-2 leading-relaxed">
              <li>To operate the platform and match candidates with job opportunities</li>
              <li>To process job applications and notify you of application status changes via email</li>
              <li>To generate AI-powered resume match scores using semantic analysis (your resume text is sent to our scoring service but is not stored beyond what is required for scoring)</li>
              <li>To provide recruiters with tools to manage their hiring process</li>
              <li>To send transactional emails (application status updates) using Resend</li>
              <li>To improve and maintain the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Resume & Document Storage</h2>
            <p className="text-slate-600 leading-relaxed">
              Resume files you upload are stored securely in Supabase Storage, a cloud storage service with AES-256 encryption at rest. Resume files are stored in a private bucket and are only accessible via time-limited signed URLs generated at the time of access. Your resume text is extracted locally and used solely for AI matching against job descriptions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data Sharing</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We do not sell your personal data. We share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 leading-relaxed">
              <li><strong>With Recruiters:</strong> When you apply for a job, your application details (name, email, phone, education, experience, cover letter, and resume) are shared with the recruiter who posted the job.</li>
              <li><strong>Service Providers:</strong> We use Supabase (database and storage), Clerk (authentication), Resend (transactional email), and Vercel (hosting). These providers process your data only as necessary to provide their services.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information if required by law or to protect our rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Data Retention</h2>
            <p className="text-slate-600 leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide services. If you wish to have your account and associated data deleted, please contact us at the email address below. Application data may be retained by recruiters within their accounts until they delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Your Rights</h2>
            <p className="text-slate-600 leading-relaxed mb-4">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 leading-relaxed">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Request your data in a portable format</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              To exercise these rights, contact us at <a href="mailto:info@smarthire.website" className="text-primary-600 hover:underline">info@smarthire.website</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Security</h2>
            <p className="text-slate-600 leading-relaxed">
              We implement industry-standard security measures including encrypted data storage, secure HTTPS transmission, time-limited signed URLs for file access, and role-based access controls. However, no method of internet transmission is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Cookies</h2>
            <p className="text-slate-600 leading-relaxed">
              Smart Hire uses cookies solely for authentication purposes (managed by Clerk). We do not use third-party advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Changes to This Policy</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the &ldquo;Last updated&rdquo; date at the top of this page. Continued use of the platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">11. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:<br />
              <a href="mailto:info@smarthire.website" className="text-primary-600 hover:underline">info@smarthire.website</a><br />
              Lahore Garrison University, Lahore, Pakistan
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-slate-100 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-400 gap-4">
          <p>&copy; {new Date().getFullYear()} Smart Hire. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
