'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

const UserButton = dynamic(
    () => import('@clerk/nextjs').then((mod) => ({ default: mod.UserButton })),
    { ssr: false }
);

export function UserNav() {
    const { isSignedIn, isLoaded } = useAuth();

    if (!isLoaded) return <div className="w-8 h-8" />;

    if (isSignedIn) {
        return <UserButton afterSignOutUrl="/" />;
    }

    return (
        <Link
            href="/sign-in"
            className="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors px-4 py-2 rounded-lg border border-slate-200 hover:border-primary-300"
        >
            Login
        </Link>
    );
}
