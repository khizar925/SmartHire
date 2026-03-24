import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service – Smart Hire',
  description: 'Terms and conditions governing your use of the Smart Hire platform.',
};

export default function TermsOfService() {
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
        <h1 className="text-4xl font-bold text-slate-900 font-serif mb-3">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-12">Last updated: {lastUpdated}</p>

        <div className="prose prose-slate max-w-none space-y-10">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing or using Smart Hire (&ldquo;the Platform&rdquo;) at smarthire.website, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Platform. These terms apply to all users, including candidates and recruiters.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description of Service</h2>
            <p className="text-slate-600 leading-relaxed">
              Smart Hire is an AI-powered recruitment management platform that enables recruiters to post job listings and manage applications, and allows candidates to discover opportunities and submit applications. The Platform uses natural language processing to generate resume-to-job match scores to assist recruiters in evaluating candidates.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. User Accounts & Roles</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              To use the Platform you must create an account. You are responsible for maintaining the confidentiality of your account credentials. Each account is assigned a role — either <strong>Candidate</strong> or <strong>Recruiter</strong> — at the time of registration. This role cannot be changed after initial selection.
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 leading-relaxed">
              <li>You must provide accurate and complete information when creating your account.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must be at least 16 years of age to use this Platform.</li>
              <li>One person may not maintain more than one account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Candidate Responsibilities</h2>
            <p className="text-slate-600 leading-relaxed mb-4">As a candidate, you agree to:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 leading-relaxed">
              <li>Submit only truthful and accurate information in your profile and applications.</li>
              <li>Upload only resumes and documents that you own or have the right to share.</li>
              <li>Submit only one application per job posting.</li>
              <li>Not upload files containing malicious code, viruses, or harmful content.</li>
              <li>Not use the Platform to harvest recruiter contact information for unsolicited outreach.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Recruiter Responsibilities</h2>
            <p className="text-slate-600 leading-relaxed mb-4">As a recruiter, you agree to:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 leading-relaxed">
              <li>Post only genuine job opportunities. Fake, misleading, or fraudulent job postings are strictly prohibited.</li>
              <li>Handle candidate data (resumes, contact details) with care and in compliance with applicable privacy laws.</li>
              <li>Not use AI match scores as the sole basis for hiring decisions. Scores are advisory tools only.</li>
              <li>Communicate application status changes promptly and honestly.</li>
              <li>Not use the Platform to collect candidate data for purposes unrelated to legitimate hiring.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. AI Scoring Disclaimer</h2>
            <p className="text-slate-600 leading-relaxed">
              The AI-powered resume match scores generated by Smart Hire are provided as a decision-support tool only. Scores reflect semantic similarity between a resume and a job description and do not account for all factors relevant to a hiring decision. Smart Hire makes no guarantee as to the accuracy, completeness, or fitness of these scores for any particular purpose. Recruiters are solely responsible for their hiring decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Prohibited Conduct</h2>
            <p className="text-slate-600 leading-relaxed mb-4">You must not:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 leading-relaxed">
              <li>Use the Platform for any unlawful purpose or in violation of any regulations.</li>
              <li>Attempt to gain unauthorised access to any part of the Platform or its infrastructure.</li>
              <li>Scrape, crawl, or systematically extract data from the Platform.</li>
              <li>Upload files containing viruses, malware, or any other harmful code.</li>
              <li>Impersonate another person or entity.</li>
              <li>Discriminate against candidates based on race, gender, religion, nationality, disability, or any other protected characteristic.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Intellectual Property</h2>
            <p className="text-slate-600 leading-relaxed">
              The Smart Hire platform, including its design, code, and branding, is owned by Smart Hire and protected by applicable intellectual property laws. You retain ownership of the content you submit (resumes, job descriptions), but grant Smart Hire a limited licence to process and display that content to provide the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              Smart Hire is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee that the Platform will be error-free, uninterrupted, or that AI scores will meet your expectations. To the maximum extent permitted by law, Smart Hire shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform, including but not limited to loss of data, missed job opportunities, or hiring decisions made in reliance on AI scores.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Data Loss &amp; Security Incidents</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              While Smart Hire takes reasonable technical measures to protect your data — including encrypted storage, private file buckets, and role-based access controls — no system is completely secure. By using the Platform, you acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 leading-relaxed">
              <li>Smart Hire is not responsible for any loss, corruption, or destruction of data resulting from technical failures, third-party service outages, or circumstances beyond our reasonable control.</li>
              <li>Smart Hire is not liable for any unauthorised access to or disclosure of your data resulting from a security breach, cyberattack, or vulnerability in third-party infrastructure (including but not limited to Supabase, Vercel, or Clerk).</li>
              <li>In the event of a data breach affecting your personal information, Smart Hire will make reasonable efforts to notify affected users in a timely manner, but accepts no financial liability for losses resulting from such an incident.</li>
              <li>You are responsible for maintaining the security of your account credentials. Smart Hire is not liable for any breach or data loss resulting from unauthorised access to your account caused by your own negligence.</li>
              <li>Smart Hire does not guarantee the permanent availability or integrity of any data stored on the Platform. You are encouraged to retain copies of important documents (such as your resume) independently.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">11. Termination</h2>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to suspend or terminate your account at our discretion if you violate these Terms of Service or engage in conduct harmful to the Platform or other users. You may also delete your account at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">12. Changes to These Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update these Terms of Service from time to time. We will notify users of material changes by updating the &ldquo;Last updated&rdquo; date. Your continued use of the Platform after changes take effect constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">13. Governing Law</h2>
            <p className="text-slate-600 leading-relaxed">
              These Terms are governed by the laws of Pakistan. Any disputes arising from your use of the Platform shall be subject to the jurisdiction of the courts of Lahore, Pakistan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">14. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:<br />
              Khizar Qamar<br />
              Lahore, Pakistan<br />
              <a href="mailto:info@smarthire.website" className="text-primary-600 hover:underline">info@smarthire.website</a>
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
