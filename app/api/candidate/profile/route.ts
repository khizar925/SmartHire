import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';

export async function GET() {
    try {
        const authResult = await requireRole('candidate');
        if (authResult instanceof NextResponse) return authResult;
        const { userId } = authResult;

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
        const authResult = await requireRole('candidate');
        if (authResult instanceof NextResponse) return authResult;
        const { userId } = authResult;

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
                updated_at: new Date().toISOString()
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
