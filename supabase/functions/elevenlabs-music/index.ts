import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

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

    // Store the MP3 file in Supabase Storage and return JSON response
    console.log('✅ ElevenLabs API success, storing file and returning JSON')
    
    const audioBuffer = await response.arrayBuffer()
    const fileName = `music-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`
    
    // Initialize Supabase client for storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('music-files')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600'
      })
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw new Error(`Failed to store audio file: ${uploadError.message}`)
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('music-files')
      .getPublicUrl(fileName)
    
    const responseJson = {
      status: 'success',
      url: urlData.publicUrl,
      duration: Math.floor(duration / 1000), // Convert to seconds
      format: 'mp3',
      filename: fileName,
      size: audioBuffer.byteLength,
      generated_at: new Date().toISOString()
    }
    
    return new Response(JSON.stringify(responseJson), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json'
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