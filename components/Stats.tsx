'use client';


export const Stats = () => {
  return (
    <div className="bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
          <div className="py-12 px-6 text-center group cursor-default">
            <div className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">28<span className="text-xl align-top ml-1 text-slate-400">days</span></div>
            <div className="text-slate-500 text-sm font-medium">Faster Time-to-Hire</div>
          </div>
          <div className="py-12 px-6 text-center group cursor-default">
            <div className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">43%</div>
            <div className="text-slate-500 text-sm font-medium">Bias Reduction</div>
          </div>
          <div className="py-12 px-6 text-center group cursor-default">
            <div className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">10k+</div>
            <div className="text-slate-500 text-sm font-medium">Active Job Seekers</div>
          </div>
           <div className="py-12 px-6 text-center group cursor-default">
            <div className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">24/7</div>
            <div className="text-slate-500 text-sm font-medium">Automated Support</div>
          </div>
        </div>
      </div>
    </div>
  );
};
