import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase-server';

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params;

    const { data: job } = await supabase
        .from('jobs')
        .select('job_title, company_name, job_location, employment_type, job_description')
        .eq('id', id)
        .single();

    if (!job) {
        return { title: 'Job Not Found' };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smarthire.website';
    const description = `${job.company_name} is hiring a ${job.job_title} in ${job.job_location}. ${job.job_description.slice(0, 120).replace(/\s+/g, ' ').trim()}...`;
    const pageUrl = `${appUrl}/jobs/${id}`;

    return {
        title: `${job.job_title} at ${job.company_name}`,
        description,
        openGraph: {
            title: `${job.job_title} at ${job.company_name}`,
            description,
            url: pageUrl,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${job.job_title} at ${job.company_name}`,
            description,
        },
    };
}

export default function JobLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
