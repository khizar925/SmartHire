// api/jobs/public/[id]/route.ts
import { supabase } from '@/lib/supabase-server';

const fetchData = async (id: string) => {
    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

    return { data, error };
}

// Retry logic with exponential backoff
const fetchDataWithRetry = async (
    id: string,
    maxRetries = 2,
    baseDelay = 1000
): Promise<{ data: any; error: any }> => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const { data, error } = await fetchData(id);

        if (!error) {
            return { data, error: null };
        }

        // Only retry on timeout or connection errors
        const isRetryable = error.message?.includes('timeout') ||
            error.message?.includes('connection') ||
            error.code === 'PGRST301'; // Supabase timeout code

        if (!isRetryable || attempt === maxRetries) {
            return { data: null, error };
        }

        lastError = error;

        // Exponential backoff: wait longer between each retry
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    return { data: null, error: lastError };
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Validate id format (assuming UUID)
        if (!id || typeof id !== 'string' || id.trim() === '') {
            return Response.json(
                { error: 'Valid Job ID is required' },
                { status: 400 }
            );
        }

        const { data, error } = await fetchDataWithRetry(id);

        if (error) {
            console.error('Database error:', {
                jobId: id,
                error: error.message,
                code: error.code,
                timestamp: new Date().toISOString()
            });

            // Return appropriate status codes based on error type
            if (error.code === 'PGRST116') { // Supabase "no rows" error
                return Response.json(
                    { error: 'Job not found' },
                    { status: 404 }
                );
            }

            return Response.json(
                { error: 'Failed to fetch job data' },
                { status: 500 }
            );
        }

        if (!data) {
            return Response.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        return Response.json(data, { status: 200 });

    } catch (error) {
        console.error('Unexpected error in GET /api/jobs/public/[id]:', error);

        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}