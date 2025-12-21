import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { UserRole } from '@/types';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { role } = body;

    // Validate role value
    if (!role || (role !== 'candidate' && role !== 'recruiter')) {
      return NextResponse.json(
        { error: 'Invalid role selected. Role must be either "candidate" or "recruiter".' },
        { status: 400 }
      );
    }

    // Get current user to check existing role
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const existingRole = user.publicMetadata?.role as UserRole | undefined;

    // Role immutability check: if role already exists, reject the request
    if (existingRole) {
      return NextResponse.json(
        { error: 'Role cannot be changed after initial selection.' },
        { status: 409 }
      );
    }

    // Update user's public metadata with the selected role
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role as UserRole,
      },
    });

    return NextResponse.json(
      { role, message: 'Role saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving user role:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

