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

        // Get Gemini API key from environment
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY
        
        if (!GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is not set')
            return new Response(
                JSON.stringify({ error: 'Embedding service not configured' }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
            )
        }

        // Use Gemini text-embedding-004 model
        const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent'
        
        let retries = 3
        let embedding: number[] | null = null
        
        while (retries > 0 && !embedding) {
            try {
                const response = await fetch(`${geminiUrl}?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'models/text-embedding-004',
                        content: {
                            parts: [{
                                text: text
                            }]
                        }
                    })
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
                }

                const data = await response.json()
                
                // Extract embedding from Gemini response
                if (data.embedding && Array.isArray(data.embedding.values)) {
                    embedding = data.embedding.values
                } else {
                    throw new Error(`Unexpected response format: ${JSON.stringify(data).substring(0, 200)}`)
                }
                
                // Gemini text-embedding-004 produces 768 dimensions by default
                if (embedding && embedding.length === 768) {
                    break
                } else {
                    console.warn(`Unexpected embedding dimension: ${embedding?.length}, expected 768`)
                    // Pad or truncate to 768 dimensions if needed
                    if (embedding && embedding.length > 768) {
                        embedding = embedding.slice(0, 768)
                    } else if (embedding) {
                        embedding = [...embedding, ...Array(768 - embedding.length).fill(0)]
                    }
                }
                
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error)
                console.error(`Attempt ${4 - retries} failed:`, errorMsg)
                retries--
                if (retries === 0) {
                    throw error
                }
                await new Promise(resolve => setTimeout(resolve, 2000))
            }
        }

        if (!embedding || embedding.length !== 768) {
            throw new Error('Failed to generate valid embedding after retries')
        }

        return new Response(
            JSON.stringify({ embedding }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error('Embedding generation error:', errorMsg, error)
        return new Response(
            JSON.stringify({ 
                error: errorMsg || 'Failed to generate embedding',
                details: error instanceof Error ? error.stack : undefined
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
        )
    }
})
