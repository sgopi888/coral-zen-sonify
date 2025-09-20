// Agent API Gateway v2.0.0 - Fresh deployment with music-generator routing
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
}

serve(async (req) => {
  console.log('=== 🚀 FRESH DEPLOY VERSION: v2.0.0 ===');
  console.log('=== Agent API Request ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const pathname = url.pathname
    console.log('Full pathname:', pathname);
    
    // Remove the function prefix to get the route - handle multiple possible prefixes
    let path = pathname.replace('/functions/v1/agents-v2', '')
    console.log('Cleaned path:', path);

    // Add a simple test endpoint for debugging
    if (req.method === 'GET' && (path === '/test' || path === 'test' || path === '')) {
      console.log('✅ Test endpoint hit - Fresh deployment working!');
      return new Response(JSON.stringify({ 
        status: 'success', 
        message: 'Agent function v2.0.0 is working - Fresh deployment!',
        timestamp: new Date().toISOString(),
        path: path,
        pathname: pathname,
        url: req.url,
        version: 'v2.0.0'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /agents - List all available agents  
    if (req.method === 'GET' && path === '/agents') {
      const { data: agents, error } = await supabase
        .from('agents')
        .select('*')
        .eq('status', 'active')

      if (error) {
        throw new Error(`Failed to fetch agents: ${error.message}`)
      }

      return new Response(JSON.stringify({ agents }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // GET /agents/{agent-id}/metadata - Get specific agent metadata
    if (req.method === 'GET' && path.match(/^\/agents\/[^\/]+\/metadata$/)) {
      const agentId = path.split('/')[2]
      
      const { data: agent, error } = await supabase
        .from('agents')
        .select('*')
        .eq('endpoint', `/agents/${agentId}`)
        .eq('status', 'active')
        .single()

      if (error) {
        return new Response(JSON.stringify({ error: 'Agent not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify(agent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST /agents/music-generator - Music generation endpoint (MAIN ENDPOINT)
    console.log('🔍 DEBUG: Checking music-generator route - path:', path, 'method:', req.method);
    if (req.method === 'POST' && (path === '/music-generator' || path === 'music-generator')) {
      console.log('🎵 SUCCESS! Music generation endpoint hit! Route matched successfully!');
      console.log('API Key present:', !!req.headers.get('x-api-key'));
      
      // Validate API key
      const apiKey = req.headers.get('x-api-key')
      if (apiKey) {
        console.log('🔑 Validating API key...');
        const { data: keyData, error: keyError } = await supabase
          .from('agent_api_keys')
          .select('id, agent_id, user_id, is_active')
          .eq('api_key', apiKey)
          .eq('is_active', true)
          .single()

        if (keyError || !keyData) {
          console.log('❌ Invalid API key');
          return new Response(JSON.stringify({ error: 'Invalid or inactive API key' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('✅ API key validated');
        // Update last_used timestamp
        await supabase
          .from('agent_api_keys')
          .update({ last_used: new Date().toISOString() })
          .eq('id', keyData.id)
      }

      const startTime = Date.now()
      const requestBody = await req.json()
      console.log('📝 Request body:', JSON.stringify(requestBody, null, 2));
      
      // Validate required fields
      if (!requestBody.prompt) {
        return new Response(JSON.stringify({ 
          error: 'Missing required field: prompt',
          status: 'error'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      console.log('🎼 Calling ElevenLabs music function...');
      // Call the music generation function
      const musicResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/elevenlabs-music`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.get('Authorization') || `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({
          prompt: requestBody.prompt,
          duration: (requestBody.duration || 60) * 1000, // Convert to milliseconds
          style: requestBody.style,
          mood: requestBody.mood,
          tempo: requestBody.tempo,
          key: requestBody.key,
          instruments: requestBody.instruments || ['piano', 'strings']
        })
      })

      const responseData = await musicResponse.json()
      const duration = Date.now() - startTime
      console.log('🎵 Music generation response:', musicResponse.status, JSON.stringify(responseData, null, 2));

      // Log the usage if API key was provided
      if (apiKey) {
        const { data: keyData } = await supabase
          .from('agent_api_keys')
          .select('id, agent_id, user_id')
          .eq('api_key', apiKey)
          .single()

        if (keyData) {
          await supabase
            .from('agent_usage_logs')
            .insert({
              agent_id: keyData.agent_id,
              api_key_id: keyData.id,
              user_id: keyData.user_id,
              endpoint: '/agents/music-generator',
              request_data: requestBody,
              response_data: responseData,
              status_code: musicResponse.status,
              duration_ms: duration
            })
        }
      }

      return new Response(JSON.stringify(responseData), {
        status: musicResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Default 404 response with debug info
    console.log('❌ No route matched - Path:', path, 'Method:', req.method);
    return new Response(JSON.stringify({ 
      error: 'Endpoint not found',
      debug: { path, method: req.method, pathname, version: 'v2.0.0' }
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Error in agents-v2 function:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      status: 'error',
      version: 'v2.0.0'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})