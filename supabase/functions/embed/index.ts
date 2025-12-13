
// supabase/functions/embed/index.ts

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @ts-ignore
Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { text } = await req.json()

        // MOCK IMPLEMENTATION
        // In real app, call OpenAI API:
        /*
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: { Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, ... },
          body: JSON.stringify({ input: text, model: 'text-embedding-ada-002' })
        })
        */

        // Return random vector of 1536 dimensions
        const mockEmbedding = Array(1536).fill(0).map(() => Math.random());

        return new Response(
            JSON.stringify({ embedding: mockEmbedding }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
        )
    }
})
