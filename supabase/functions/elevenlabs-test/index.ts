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
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')

    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    console.log('Testing ElevenLabs API with key:', elevenLabsApiKey.substring(0, 8) + '...')

    // Test the API endpoint exactly like your Python code
    const testPrompt = "Simple piano melody"
    const response = await fetch('https://api.elevenlabs.io/v1/music/detailed', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: testPrompt,
        music_length_ms: 10000,
        model_id: 'music_v1'
      }),
    })

    console.log('ElevenLabs API Response Status:', response.status)
    console.log('ElevenLabs API Response Headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API Error Response:', errorText)
      
      return new Response(
        JSON.stringify({ 
          error: `ElevenLabs API error: ${response.status}`,
          details: errorText,
          status: response.status
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if response is audio or JSON
    const contentType = response.headers.get('content-type') || ''
    console.log('Response Content-Type:', contentType)

    if (contentType.includes('application/json')) {
      const jsonData = await response.json()
      console.log('JSON Response:', jsonData)
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'ElevenLabs API test successful',
          responseType: 'json',
          data: jsonData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Handle audio response
      const audioData = await response.arrayBuffer()
      console.log('Audio data size:', audioData.byteLength)
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'ElevenLabs API test successful - received audio',
          responseType: 'audio',
          audioSize: audioData.byteLength
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Test function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})