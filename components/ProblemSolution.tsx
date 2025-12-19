'use client';

import { X, Check } from 'lucide-react';

export const ProblemSolution = () => {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-primary-600 font-bold tracking-wide uppercase text-sm mb-3">The Smart Hire Difference</h2>
            <h3 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 mb-6">
                Why traditional hiring is obsolete
            </h3>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* The Problem */}
          <div className="relative group">
            <div className="absolute inset-0 bg-red-100 rounded-3xl transform rotate-3 scale-[0.98] transition-transform group-hover:rotate-2"></div>
            <div className="relative bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-slate-100">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider mb-8">
                The Old Way
              </div>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 opacity-70">
                  <div className="p-1 bg-red-100 rounded-full mt-1">
                    <X className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 mb-1">Slow Manual Screening</strong>
                    <span className="text-slate-500 leading-relaxed text-sm">HR managers waste hours reading mismatched resumes. Average 23-28 days to hire.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4 opacity-70">
                  <div className="p-1 bg-red-100 rounded-full mt-1">
                     <X className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 mb-1">Unconscious Bias</strong>
                    <span className="text-slate-500 leading-relaxed text-sm">Human judgement is prone to errors, missing great talent due to subjective bias.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4 opacity-70">
                  <div className="p-1 bg-red-100 rounded-full mt-1">
                     <X className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 mb-1">Candidate Ghosting</strong>
                    <span className="text-slate-500 leading-relaxed text-sm">60% of applicants never hear back, damaging employer brand.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* The Solution */}
          <div className="relative group">
             <div className="absolute inset-0 bg-primary-600 rounded-3xl transform -rotate-3 scale-[0.98] transition-transform group-hover:-rotate-2 opacity-10"></div>
            <div className="relative bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-primary-100">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-8">
                The Smart Hire Way
              </div>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="p-1 bg-primary-100 rounded-full mt-1">
                    <Check className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 mb-1">Instant AI Matching</strong>
                    <span className="text-slate-600 leading-relaxed text-sm">Algorithms analyze and rank candidates in seconds based on actual skills.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-1 bg-primary-100 rounded-full mt-1">
                    <Check className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 mb-1">Fair Evaluation</strong>
                    <span className="text-slate-600 leading-relaxed text-sm">Blind data processing ensures decisions are made on merit, not demographics.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-1 bg-primary-100 rounded-full mt-1">
                    <Check className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 mb-1">Real-time Visibility</strong>
                    <span className="text-slate-600 leading-relaxed text-sm">Automated updates keep candidates engaged and informed at every step.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
