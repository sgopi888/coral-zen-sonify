// Agent API Gateway v1.1.1 - Fixed music-generator routing
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
}

serve(async (req) => {
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
    let path = pathname.replace('/functions/v1/agents', '')
    console.log('Cleaned path:', path);

    // Add a simple test endpoint for debugging
    if (req.method === 'GET' && (path === '/test' || path === 'test')) {
      console.log('Test endpoint hit');
      return new Response(JSON.stringify({ 
        status: 'success', 
        message: 'Agent function is working',
        timestamp: new Date().toISOString(),
        path: path,
        pathname: pathname,
        url: req.url
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /agents - List all available agents
    if (req.method === 'GET' && path === '') {
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
    if (req.method === 'GET' && path.match(/^\/[^\/]+\/metadata$/)) {
      const agentId = path.split('/')[1]
      
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

    // POST /agents/:id/api-keys - Generate API key for specific agent
    if (req.method === 'POST' && path.match(/^\/[^\/]+\/api-keys$/)) {
      const agentId = path.split('/')[1]
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        req.headers.get('Authorization')?.replace('Bearer ', '') || ''
      )
      
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Verify agent exists
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('id')
        .eq('endpoint', `/agents/${agentId}`)
        .eq('status', 'active')
        .single()

      if (agentError || !agent) {
        return new Response(JSON.stringify({ error: 'Agent not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const requestBody = await req.json()
      const keyName = requestBody.name || 'Generated API Key'
      
      // Generate new API key
      const apiKey = crypto.randomUUID()
      
      // Store in database
      const { error: insertError } = await supabase
        .from('agent_api_keys')
        .insert({
          agent_id: agent.id,
          api_key: apiKey,
          name: keyName,
          user_id: user.id,
          is_active: true
        })

      if (insertError) {
        return new Response(JSON.stringify({ error: 'Failed to create API key' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        status: 'success',
        api_key: apiKey,
        message: 'API key generated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // DELETE /agents/:id/api-keys/:keyId - Delete API key
    if (req.method === 'DELETE' && path.match(/^\/[^\/]+\/api-keys\/[^\/]+$/)) {
      const pathParts = path.split('/')
      const keyId = pathParts[3]
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        req.headers.get('Authorization')?.replace('Bearer ', '') || ''
      )
      
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Delete API key (RLS will ensure user can only delete their own keys)
      const { error: deleteError } = await supabase
        .from('agent_api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', user.id)

      if (deleteError) {
        return new Response(JSON.stringify({ error: 'Failed to delete API key' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        status: 'success',
        message: 'API key deleted successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST /agents/music-generator - Music generation endpoint
    console.log('DEBUG: Checking music-generator route - path:', path, 'method:', req.method);
    if (req.method === 'POST' && (path === '/music-generator' || path === 'music-generator')) {
      console.log('🎵 Music generation endpoint hit! Route matched successfully!');
      console.log('API Key present:', !!req.headers.get('x-api-key'));
      // Validate API key
      const apiKey = req.headers.get('x-api-key')
      if (apiKey) {
        const { data: keyData, error: keyError } = await supabase
          .from('agent_api_keys')
          .select('id, agent_id, user_id, is_active')
          .eq('api_key', apiKey)
          .eq('is_active', true)
          .single()

        if (keyError || !keyData) {
          return new Response(JSON.stringify({ error: 'Invalid or inactive API key' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Update last_used timestamp
        await supabase
          .from('agent_api_keys')
          .update({ last_used: new Date().toISOString() })
          .eq('id', keyData.id)
      }

      const startTime = Date.now()
      const requestBody = await req.json()
      
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

    // Default 404 response
    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in agents function:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})