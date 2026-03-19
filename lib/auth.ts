import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { UserRole } from '@/types';

/**
 * Authenticate the request and verify the user has the required role.
 * Returns { userId } on success, or a NextResponse (403/401) on failure.
 */
export async function requireRole(
  role: UserRole
): Promise<{ userId: string } | NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userRole = user.publicMetadata?.role as UserRole | undefined;

  if (userRole !== role) {
    return NextResponse.json(
      { error: 'Forbidden: insufficient permissions' },
      { status: 403 }
    );
  }

  return { userId };
}
