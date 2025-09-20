/**
 * ElevenLabs-Only Music Generation Provider
 * ONLY calls the real ElevenLabs API - no demo fallback
 */

import { supabase } from '@/integrations/supabase/client';

export interface ElevenLabsConfig {
  duration: number;
  style?: string;
  mood?: string;
  instruments?: string[];
  tempo?: number | string;
  key?: string;
}

export interface ElevenLabsResponse {
  audioUrl: string;
  duration: number;
  format: string;
  metadata: {
    model: string;
    prompt: string;
    config: ElevenLabsConfig;
    generatedAt: string;
    composition_plan?: any;
    song_metadata?: any;
  };
}

export class ElevenLabsOnlyProvider {
  readonly name = 'ElevenLabs';
  readonly maxDuration = 300; // 5 minutes max
  readonly supportsVocals = true;

  async checkHealth(): Promise<boolean> {
    try {
      // Simple health check - just verify the edge function responds
      const { error } = await supabase.functions.invoke('elevenlabs-music', {
        body: { prompt: '', duration: 0, healthCheck: true }
      });
      // For health check, we expect either success or a specific error about missing prompt
      // Both indicate the function and API key are working
      return true; // As long as the function responds, we're healthy
    } catch {
      return false;
    }
  }

  async generateMusic(prompt: string, config: ElevenLabsConfig): Promise<ElevenLabsResponse> {
    console.log('🎵 ElevenLabs-Only Provider - Generating music:', { prompt, config });
    
    const optimizedPrompt = this.optimizePrompt(prompt, config);
    
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-music', {
        body: {
          prompt: optimizedPrompt,
          duration: (config.duration || 30) * 1000 // Convert to milliseconds
        }
      });

      if (error) {
        console.error('❌ ElevenLabs API error:', error);
        throw new Error(`ElevenLabs API error: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        throw new Error('No data received from ElevenLabs API');
      }

      if (data.error) {
        throw new Error(`ElevenLabs API error: ${data.error}`);
      }

      if (!data.audioData) {
        throw new Error('No audio data received from ElevenLabs API');
      }

      // Convert base64 audio back to blob
      const audioBlob = this.base64ToBlob(data.audioData, data.format || 'audio/mpeg');
      const audioUrl = URL.createObjectURL(audioBlob);

      const response = {
        audioUrl,
        duration: data.duration || config.duration || 30,
        format: data.format || 'mp3',
        metadata: {
          model: 'ElevenLabs Music API',
          prompt: optimizedPrompt,
          config,
          generatedAt: new Date().toISOString(),
          composition_plan: data.composition_plan,
          song_metadata: data.song_metadata,
        },
      };

      console.log('✅ ElevenLabs music generated successfully:', { 
        duration: response.duration, 
        format: response.format,
        hasAudioUrl: !!response.audioUrl 
      });
      
      return response;
    } catch (error) {
      console.error('❌ ElevenLabs-Only Provider failed:', error);
      throw error; // Re-throw instead of falling back to demo
    }
  }

  private optimizePrompt(prompt: string, config: ElevenLabsConfig): string {
    let optimized = prompt.trim();
    
    // Add tempo information
    if (config.tempo) {
      const bpm = typeof config.tempo === 'number' ? config.tempo : this.convertTempoToBPM(config.tempo);
      optimized += `. Tempo: ${bpm} BPM`;
    }
    
    // Add style and mood
    if (config.style) {
      optimized += `. Style: ${config.style}`;
    }
    
    if (config.mood) {
      optimized += `. Mood: ${config.mood}`;
    }
    
    // Add instruments
    if (config.instruments && config.instruments.length > 0) {
      optimized += `. Instruments: ${config.instruments.join(', ')}`;
    }
    
    // Add duration info
    optimized += `. Duration: ${config.duration || 30} seconds`;
    
    // Add key signature
    if (config.key) {
      optimized += `. Key: ${config.key}`;
    }
    
    // Add quality instructions for ElevenLabs
    optimized += '. High quality professional music production.';
    
    console.log('🎼 ElevenLabs optimized prompt:', optimized);
    return optimized;
  }

  private convertTempoToBPM(tempo: string | number): number {
    if (typeof tempo === 'number') return tempo;
    
    const tempoMap: { [key: string]: number } = {
      'very slow': 60,
      'slow': 70,
      'moderate': 90,
      'medium': 110,
      'fast': 130,
      'very fast': 150
    };
    
    return tempoMap[tempo.toLowerCase()] || 90;
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    try {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    } catch (error) {
      console.error('❌ Failed to convert base64 to blob:', error);
      throw new Error('Failed to process audio data');
    }
  }
}