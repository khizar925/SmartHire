'use client';

import { Button } from './Button';

export const CTA = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-[2.5rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden group">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary-900 opacity-50 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-primary-600 opacity-20 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mb-6 tracking-tight">
              Ready to hire smarter?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of companies and candidates using Smart Hire to connect with the right opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-black hover:shadow-xl shadow-white/10 border-0"
                onClick={(e) => e.preventDefault()}
              >
                Get Started Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white/20 hover:bg-white/10 hover:border-white"
                onClick={(e) => e.preventDefault()}
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
