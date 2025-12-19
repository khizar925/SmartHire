'use client';

import { Check, Zap } from 'lucide-react';
import { Button } from './Button';

const plans = [
    {
        name: 'Free',
        price: '$0',
        period: '/month',
        description: 'Perfect for candidates just starting their job search journey.',
        features: [
            'Professional Profile Builder',
            'Unlimited Job Search',
            'Basic Application Tracking',
            'Standard Email Support',
            'Job Alerts'
        ],
        cta: 'Get Started',
        popular: false,
    },
    {
        name: 'Pro',
        price: '$20',
        period: '/month',
        description: 'For power users and recruiters who want AI-driven advantages.',
        features: [
            'Everything in Free',
            'AI Resume Optimization',
            'Advanced Match Insights',
            'Priority Application Status',
            'Direct Recruiter Messaging',
            'Unlimited AI Mock Interviews'
        ],
        cta: 'Upgrade to Pro',
        popular: true,
    }
];

export const Pricing = () => {
    return (
        <section id="pricing" className="py-24 bg-white scroll-mt-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-serif text-slate-900 mb-6 tracking-tight">
                        Simple, transparent pricing.
                    </h2>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        Start for free, upgrade when you need more power. No hidden fees.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-3xl p-8 lg:p-10 transition-all duration-300 ${plan.popular
                                    ? 'bg-slate-900 text-white shadow-2xl scale-100 md:scale-105 z-10'
                                    : 'bg-slate-50 text-slate-900 border border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 -mt-4 mr-8">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                                        <Zap className="h-3 w-3 fill-current" /> Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-5xl font-bold tracking-tight ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                                        {plan.price}
                                    </span>
                                    <span className={`text-lg font-medium ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {plan.period}
                                    </span>
                                </div>
                                <p className={`mt-4 text-sm leading-relaxed ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`mt-0.5 p-0.5 rounded-full ${plan.popular ? 'bg-primary-500/20 text-primary-400' : 'bg-primary-100 text-primary-600'}`}>
                                            <Check className="h-3.5 w-3.5" />
                                        </div>
                                        <span className={`text-sm font-medium ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant={plan.popular ? 'primary' : 'secondary'}
                                className={`w-full ${plan.popular ? ' text-slate-900' : 'bg-white'}`}
                                onClick={(e) => e.preventDefault()}
                            >
                                {plan.cta}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};