import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { data, error } = await supabase
            .from('candidate_profiles')
            .select('*')
            .eq('candidate_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is code for no rows found
            console.error('Error fetching candidate profile:', error);
            return NextResponse.json(
                { error: 'Failed to fetch profile' },
                { status: 500 }
            );
        }

        return NextResponse.json(data || null);
    } catch (error) {
        console.error('Unexpected error in profile GET:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            fullName,
            email,
            phone,
            address,
            educationLevel,
            yearsOfExperience
        } = body;

        // Validate required fields
        if (!fullName || !email) {
            return NextResponse.json(
                { error: 'Full name and email are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('candidate_profiles')
            .upsert({
                candidate_id: userId,
                full_name: fullName,
                email,
                phone,
                address,
                education_level: educationLevel,
                years_of_experience: yearsOfExperience,
                updated_at: new RegExp('now()').test('now()') ? undefined : new Date().toISOString() // Let DB handle default now() if omitting
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving candidate profile:', error);
            return NextResponse.json(
                { error: 'Failed to save profile' },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Unexpected error in profile POST:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
