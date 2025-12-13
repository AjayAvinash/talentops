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
                    body: JSON.stringify({ 
                        inputs: text,
                        options: { 
                            wait_for_model: true,
                            use_cache: false
                        } 
                    })
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    // If model is loading, wait and retry
                    if (response.status === 503) {
                        await new Promise(resolve => setTimeout(resolve, 3000))
                        retries--
                        continue
                    }
                    throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`)
                }

                const data = await response.json()
                
                // Hugging Face feature extraction returns nested array: [[embedding]]
                if (Array.isArray(data)) {
                    if (data.length > 0 && Array.isArray(data[0])) {
                        embedding = data[0] // Get first embedding array
                    } else if (data.length > 0 && typeof data[0] === 'number') {
                        embedding = data // Direct array of numbers
                    } else {
                        throw new Error(`Unexpected response format: ${JSON.stringify(data).substring(0, 200)}`)
                    }
                } else {
                    throw new Error(`Response is not an array: ${JSON.stringify(data).substring(0, 200)}`)
                }
                
                // Ensure we have 768 dimensions (pad or truncate if needed)
                if (embedding && embedding.length !== 768) {
                    if (embedding.length > 768) {
                        embedding = embedding.slice(0, 768)
                    } else {
                        embedding = [...embedding, ...Array(768 - embedding.length).fill(0)]
                    }
                }
                
                if (embedding && embedding.length === 768) {
                    break
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
