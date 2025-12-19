'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Briefcase, Users } from 'lucide-react';
import { Button } from './Button';

const users = [
  {
    id: 'recruiters',
    label: 'Recruiters',
    icon: <Briefcase />,
    title: "Focus on people, not paperwork.",
    content: "Recruiters and companies require automation in shortlisting candidates and streamlining communication. Smart Hire handles the sifting so you can focus on the interview.",
    points: [
      "AI-based candidate ranking",
      "Automated interview scheduling",
      "Unified applicant management dashboard"
    ],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1600"
  },
  {
    id: 'candidates',
    label: 'Candidates',
    icon: <Users />,
    title: "Transparency you deserve.",
    content: "Job seekers require clear and timely communication, as well as just and unprejudiced appraisals. Never wonder where your application stands again.",
    points: [
      "Real-time application status tracking",
      "Unbiased AI evaluation",
      "Smart job recommendations"
    ],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1600"
  }
];

export const UsersSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="users" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-serif text-slate-900 mb-4">Built for everyone.</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            A unified platform that connects all stakeholders in the recruitment ecosystem.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tabs */}
          <div className="lg:w-1/4 space-y-2">
            {users.map((user, index) => (
              <button
                key={user.id}
                onClick={() => setActiveTab(index)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-4 ${
                  activeTab === index 
                    ? 'bg-white shadow-lg shadow-slate-200/50 text-primary-600 ring-1 ring-primary-100' 
                    : 'text-slate-500 hover:bg-white/50 hover:text-slate-900'
                }`}
              >
                <div className={`p-2 rounded-lg ${activeTab === index ? 'bg-primary-50' : 'bg-transparent'}`}>
                  {React.cloneElement(user.icon as React.ReactElement<{ className?: string }>, { className: "h-5 w-5" })}
                </div>
                <span className="font-semibold">{user.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="lg:w-3/4 bg-white rounded-3xl p-8 lg:p-10 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 flex flex-col md:flex-row gap-10 items-center animate-fade-in">
            <div className="flex-1 space-y-8">
              <div>
                  <h3 className="text-2xl font-bold font-serif text-slate-900 mb-3">{users[activeTab].title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">
                    {users[activeTab].content}
                  </p>
              </div>
              <ul className="space-y-4">
                {users[activeTab].points.map((point, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                    </div>
                    {point}
                  </li>
                ))}
              </ul>
              <div className="pt-2">
                <Button variant="outline" size="sm">Learn More</Button>
              </div>
            </div>
            <div className="w-full md:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-lg relative">
              <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply z-10"></div>
              <Image 
                src={users[activeTab].image} 
                alt={users[activeTab].label} 
                fill
                className="object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
