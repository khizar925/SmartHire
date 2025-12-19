'use client';

import Image from 'next/image';
import { Button } from './Button';
import Link from 'next/link';
import { ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import demoPic from '@/assets/demo-pic.jpg';

export const Hero = () => {
  return (
    <div className="relative bg-white pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Modern Abstract Background */}
      <div className="absolute top-0 inset-x-0 h-screen pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-primary-100 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
        <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

        {/* Badge with Shimmer Animation - Wrapper handles fade-in, Inner handles shimmer */}
        <div className="animate-fade-in-up opacity-0 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-[linear-gradient(110deg,#f8fafc,45%,#f1f5f9,55%,#f8fafc)] bg-[length:200%_100%] animate-shimmer text-slate-600 text-xs font-semibold uppercase tracking-wide transition-all hover:shadow-md cursor-default">
            <Sparkles className="h-3.5 w-3.5 text-primary-500 fill-primary-100" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-600 to-slate-800"> Launching Soon </span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up opacity-0 delay-100 max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-bold font-serif text-slate-900 tracking-tight mb-8 leading-[1.1]">
          Recruitment, <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 italic">Reimagined.</span>
        </h1>

        {/* Subhead */}
        <p className="animate-fade-in-up opacity-0 delay-200 max-w-2xl mx-auto text-xl text-slate-500 mb-10 leading-relaxed font-medium">
          Stop sifting through resumes. Let our AI handle the screening, scheduling, and insights so you can focus on the people.
        </p>

        {/* Buttons */}
        <div className="animate-fade-in-up opacity-0 delay-300 flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 w-full sm:w-auto">
          <Link href="/signup">
            <Button
              variant="black"
              size="lg"
              className="w-full sm:w-auto gap-2 text-base shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 transition-transform"
            >
              Begin Your Journey
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>

        </div>

        {/* Social Proof / Trust */}
        <div className="animate-fade-in-up opacity-0 delay-500 flex flex-wrap justify-center gap-y-4 gap-x-8 text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary-600" />
            <span>23 Days Saved / Hire</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary-600" />
            <span>Bias-Free Matching</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary-600" />
            <span>Verified Candidates</span>
          </div>
        </div>
      </div>

      {/* UI Mockup */}
      <div className="mt-20 relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up opacity-0 delay-500 rounded-2xl bg-slate-900 p-2 shadow-2xl ring-1 ring-slate-900/10">
          <div className="rounded-xl overflow-hidden bg-slate-800 border border-slate-700 aspect-[16/9] relative group">
            <Image
              src={demoPic}
              alt="Platform Dashboard"
              fill
              className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>

            {/* Floating Card Animation */}
            <div className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-2xl w-64 animate-float hidden md:block">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">98</div>
                <div>
                  <p className="text-white text-sm font-semibold">Match Score</p>
                  <p className="text-white/60 text-xs">Top Candidate Found</p>
                </div>
              </div>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-[98%] bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
