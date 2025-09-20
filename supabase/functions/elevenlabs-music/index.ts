import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, duration = 10000, healthCheck = false } = await req.json()
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')

    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    // Handle health check requests
    if (healthCheck) {
      return new Response(
        JSON.stringify({ status: 'healthy', message: 'ElevenLabs API key configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate prompt for actual generation
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt is required for music generation')
    }

    console.log('Generating music with ElevenLabs:', { prompt, duration })

    const response = await fetch('https://api.elevenlabs.io/v1/music/detailed', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        music_length_ms: duration,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('ElevenLabs API error:', error)
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    // Return the audio directly as blob - no conversion needed
    console.log('✅ ElevenLabs API success, returning audio directly')
    
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="generated-music.mp3"'
      }
    })

  } catch (error) {
    console.error('Error in elevenlabs-music function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})