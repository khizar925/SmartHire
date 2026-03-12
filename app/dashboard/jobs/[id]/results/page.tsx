import { redirect } from 'next/navigation';

// The /results page has been merged into /applications.
// Any direct navigation to /results is redirected automatically.
export default function ResultsRedirectPage({ params }: { params: { id: string } }) {
    redirect(`/dashboard/jobs/${params.id}/applications`);
}
