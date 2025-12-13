import { supabase } from '../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Generate embedding for text using the embed edge function
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
    }

    if (!SUPABASE_URL) {
        throw new Error('Supabase URL is not configured');
    }

    // Ensure URL doesn't have double slashes
    const baseUrl = SUPABASE_URL.endsWith('/') ? SUPABASE_URL.slice(0, -1) : SUPABASE_URL;
    const embedUrl = `${baseUrl}/functions/v1/embed`;
    
    try {
        const response = await fetch(embedUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ text: text.trim() }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Embedding generation failed: ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorMessage;
            } catch {
                errorMessage = `${errorMessage} - ${errorText.substring(0, 200)}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (!data.embedding || !Array.isArray(data.embedding)) {
            throw new Error('Invalid embedding response format from edge function');
        }

        if (data.embedding.length !== 768) {
            throw new Error(`Invalid embedding dimension: expected 768, got ${data.embedding.length}`);
        }

        return data.embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

/**
 * Perform vector similarity search on candidates
 */
export async function vectorSearchCandidates(
    query: string,
    limit: number = 20
): Promise<Array<{ candidate: any; similarity: number }>> {
    try {
        // Generate embedding for the search query
        const queryEmbedding = await generateEmbedding(query);

        // Format embedding as string for PostgreSQL vector type
        const embeddingString = `[${queryEmbedding.join(',')}]`;

        // Perform vector similarity search using pgvector
        // Using cosine distance (<=>) operator, results sorted by similarity
        const { data, error } = await supabase.rpc('match_candidates', {
            query_embedding: embeddingString,
            match_threshold: 0.3, // Minimum similarity threshold
            match_count: limit,
        });

        if (error) {
            // If RPC function doesn't exist, fall back to text search
            console.warn('RPC function error, may need to create SQL functions:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Vector search error:', error);
        // Return empty array - caller should handle fallback
        throw error;
    }
}


/**
 * Perform vector similarity search on jobs
 */
export async function vectorSearchJobs(
    query: string,
    limit: number = 20
): Promise<Array<{ job: any; similarity: number }>> {
    try {
        // Generate embedding for the search query
        const queryEmbedding = await generateEmbedding(query);

        // Format embedding as string for PostgreSQL vector type
        const embeddingString = `[${queryEmbedding.join(',')}]`;

        // Perform vector similarity search using pgvector
        const { data, error } = await supabase.rpc('match_jobs', {
            query_embedding: embeddingString,
            match_threshold: 0.3,
            match_count: limit,
        });

        if (error) {
            console.warn('RPC function error, may need to create SQL functions:', error);
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Vector search error:', error);
        throw error;
    }
}

