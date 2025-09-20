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
    const { prompt, duration = 10000 } = await req.json()
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')

    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured')
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

    // Get the audio data
    const audioData = await response.arrayBuffer()
    
    // Convert to base64 for transport
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioData))
    )

    return new Response(
      JSON.stringify({ 
        audioData: base64Audio,
        format: 'audio/mpeg',
        duration: duration / 1000
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

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