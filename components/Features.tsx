'use client';


import { 
  Brain, 
  Clock, 
  Scale, 
  LineChart, 
  LayoutDashboard, 
  ShieldCheck 
} from 'lucide-react';

const features = [
  {
    title: "AI Candidate Matching",
    description: "Deep learning algorithms analyze resumes and job descriptions to find the perfect match instantly.",
    icon: <Brain className="h-6 w-6" />,
  },
  {
    title: "Automated Shortlisting",
    description: "Rank candidates by skills and compatibility scores. Save hours of manual review time.",
    icon: <Clock className="h-6 w-6" />,
  },
  {
    title: "Unbiased Evaluation",
    description: "Focus on qualifications. Our system strips bias-inducing data from the initial screening process.",
    icon: <Scale className="h-6 w-6" />,
  },
  {
    title: "Role-Based Dashboards",
    description: "Tailored interfaces for Recruiters and Candidates to manage their specific workflows efficiently.",
    icon: <LayoutDashboard className="h-6 w-6" />,
  },
  {
    title: "Analytics & Insights",
    description: "Real-time metrics on time-to-hire, funnel drop-off, and sourcing effectiveness.",
    icon: <LineChart className="h-6 w-6" />,
  },
  {
    title: "Enterprise Security",
    description: "JWT authentication, OAuth integration, and encrypted data storage for total peace of mind.",
    icon: <ShieldCheck className="h-6 w-6" />,
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20">
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-slate-900 mb-6 tracking-tight">
            Powerful features for<br />
            modern recruitment.
          </h2>
          <div className="h-1 w-20 bg-primary-600 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group p-6 rounded-2xl bg-white hover:bg-slate-50 transition-colors duration-300 border border-transparent hover:border-slate-100"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
              <p className="text-slate-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
