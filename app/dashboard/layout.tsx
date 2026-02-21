import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardLayoutClient } from '@/components/DashboardLayoutClient';
import type { UserRole } from '@/types';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const role = user.publicMetadata?.role as UserRole | undefined;

    const firstName = user.firstName || undefined;

    return (
        <DashboardLayoutClient role={role} firstName={firstName}>
            {children}
        </DashboardLayoutClient>
    );
}
