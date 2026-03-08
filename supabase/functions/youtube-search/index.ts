const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://pipedapi.in.projectsegfau.lt',
  'https://api.piped.yt',
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    for (const instance of PIPED_INSTANCES) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(
          `${instance}/search?q=${encodeURIComponent(query)}&filter=videos`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);

        if (!res.ok) continue;

        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const results = data.items
            .filter((item: any) => item.url?.includes('/watch'))
            .slice(0, 10)
            .map((item: any) => ({
              videoId: item.url?.replace('/watch?v=', '') || '',
              title: item.title || 'Untitled',
              thumbnail: item.thumbnail || '',
              uploaderName: item.uploaderName || '',
              duration: item.duration || 0,
            }));

          return new Response(JSON.stringify({ results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch {
        continue;
      }
    }

    return new Response(JSON.stringify({ error: 'Search unavailable, please try again' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
