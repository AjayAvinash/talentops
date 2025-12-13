
// supabase/functions/parse-resume/index.ts

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
        const { fileUrl, fileType } = await req.json()

        // MOCK IMPLEMENTATION
        // In a real world, we'd fetch the file from storage, use a parsing lib (e.g. pdf.js not avail in deno easily without npm compat or api comparison)
        // Here we just return mock data.

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockData = {
            name: "John Doe (Parsed)",
            email: "john.doe@example.com",
            phone: "+1-555-0100",
            skills: ["React", "TypeScript", "Node.js"],
            experience: 5,
            education: "BS Computer Science",
            text: "Experienced software engineer with 5 years in React..."
        }

        return new Response(
            JSON.stringify(mockData),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
        )
    }
})
