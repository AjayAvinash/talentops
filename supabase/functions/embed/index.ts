// supabase/functions/embed/index.ts

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// @ts-ignore
Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { 
            status: 204,
            headers: corsHeaders 
        })
    }

    try {
        const { text } = await req.json()

        if (!text || typeof text !== 'string') {
            return new Response(
                JSON.stringify({ error: 'Text is required' }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
            )
        }

        // Use Hugging Face Inference API (free, no API key required for public models)
        // Using sentence-transformers/all-mpnet-base-v2 which outputs 768 dimensions
        // This is a high-quality model that works well for semantic search
        const model = 'sentence-transformers/all-mpnet-base-v2'
        const hfUrl = `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`
        
        let retries = 3
        let embedding: number[] | null = null
        
        while (retries > 0 && !embedding) {
            try {
                const response = await fetch(hfUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ inputs: text, options: { wait_for_model: true } })
                })

                if (!response.ok) {
                    // If model is loading, wait and retry
                    if (response.status === 503) {
                        await new Promise(resolve => setTimeout(resolve, 2000))
                        retries--
                        continue
                    }
                    throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`)
                }

                const data = await response.json()
                
                // Hugging Face returns the embedding directly as an array
                if (Array.isArray(data) && data.length > 0) {
                    embedding = Array.isArray(data[0]) ? data[0] : data
                } else if (Array.isArray(data)) {
                    embedding = data
                } else {
                    throw new Error('Unexpected response format from Hugging Face')
                }
                
                // Ensure we have 768 dimensions (pad or truncate if needed)
                if (embedding.length !== 768) {
                    if (embedding.length > 768) {
                        embedding = embedding.slice(0, 768)
                    } else {
                        embedding = [...embedding, ...Array(768 - embedding.length).fill(0)]
                    }
                }
                
                break
            } catch (error) {
                retries--
                if (retries === 0) {
                    throw error
                }
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
        }

        if (!embedding) {
            throw new Error('Failed to generate embedding after retries')
        }

        return new Response(
            JSON.stringify({ embedding }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    } catch (error) {
        console.error('Embedding generation error:', error)
        return new Response(
            JSON.stringify({ error: error.message || 'Failed to generate embedding' }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
        )
    }
})
