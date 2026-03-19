'use client';

import { BrainCircuit, Github, Twitter, Linkedin, Heart } from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl text-slate-900 font-serif">Smart Hire</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-6">
              An advanced, AI-powered recruitment management system built to automate and optimize the hiring process for everyone.
            </p>
            {/* <div className="flex gap-4">
              <a href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-slate-900 transition-colors"><Github className="h-5 w-5" /></a>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-slate-900 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-slate-900 transition-colors"><Linkedin className="h-5 w-5" /></a>
            </div> */}
          </div>

          <div className="md:col-span-2">
            <h4 className="font-bold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#features" className="hover:text-primary-600 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-primary-600 transition-colors">How It Works</a></li>
              <li><a href="#users" className="hover:text-primary-600 transition-colors">For Recruiters</a></li>
              <li><a href="#users" className="hover:text-primary-600 transition-colors">For Candidates</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link href="/privacy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-bold text-slate-900 mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li> Khizar Qamar</li>
              <li>Lahore, Pakistan</li>
              <li><a href="mailto:info@smarthire.app" className="hover:text-primary-600">info@smarthire.app</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p className="flex items-center gap-1">
            &copy; {new Date().getFullYear()} Smart Hire.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
