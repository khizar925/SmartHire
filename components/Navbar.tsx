'use client';

import { useState, useEffect } from 'react';
import { Menu, X, BrainCircuit } from 'lucide-react';
import { Button } from './Button';
import Link from 'next/link';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Users', href: '#users' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100/50' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
            <div className="bg-primary-600 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 font-serif">
              Smart Hire
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/sign-in"
            >
              <Button
                variant="black"
                size="sm"
              >
                Login
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 absolute w-full shadow-lg animate-fade-in">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 px-3">
              <Link href="/sign-in">
                <Button
                  variant="black"
                  className="w-full"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
