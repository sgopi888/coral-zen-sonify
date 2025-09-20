/**
 * ElevenLabs Music Generation Provider
 * Integrates with ElevenLabs Music API for high-quality music generation
 */

import { MusicProvider, MusicGenerationConfig, GeneratedMusic } from '@/services/MusicGenerationService';
import { supabase } from '@/integrations/supabase/client';

export class ElevenLabsProvider implements MusicProvider {
  name = 'ElevenLabs Music';
  maxDuration = 300; // 5 minutes max for ElevenLabs
  supportsVocals = true;

  async checkHealth(): Promise<boolean> {
    // For now, always return true in demo mode
    return true;
  }

  async generateMusic(prompt: string, config: MusicGenerationConfig): Promise<GeneratedMusic> {
    console.log('🎵 Generating ElevenLabs music with config:', config);
    
    const optimizedPrompt = this.optimizePromptForElevenLabs(prompt, config);
    
    try {
      // Call the real ElevenLabs API via Supabase edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-music', {
        body: {
          prompt: optimizedPrompt,
          duration: (config.duration || 30) * 1000 // Convert to milliseconds
        }
      });

      if (error) {
        console.error('❌ ElevenLabs API error:', error);
        // Fall back to demo if API fails
        return this.generateDemo(optimizedPrompt, config);
      }

      if (data && data.audioData) {
        // Convert base64 audio back to blob
        const audioBlob = this.base64ToBlob(data.audioData, data.format || 'audio/mpeg');
        const audioUrl = URL.createObjectURL(audioBlob);

        return {
          audioUrl,
          duration: data.duration || config.duration || 30,
          format: data.format || 'mp3',
          metadata: {
            model: 'ElevenLabs Music API',
            prompt: optimizedPrompt,
            config,
            generatedAt: new Date().toISOString(),
          },
        };
      }
    } catch (error) {
      console.error('❌ Failed to generate music with ElevenLabs API:', error);
    }
    
    // Fall back to demo if API call fails
    console.log('⚠️ Falling back to demo mode');
    return this.generateDemo(optimizedPrompt, config);
  }

  private optimizePromptForElevenLabs(prompt: string, config: MusicGenerationConfig): string {
    let optimized = prompt;
    
    // Add tempo information
    if (config.tempo) {
      const bpm = typeof config.tempo === 'number' ? config.tempo : this.convertTempoToBPM(config.tempo);
      optimized += `. Set tempo to ${bpm} BPM`;
    }
    
    // Add style and mood
    if (config.style) {
      optimized += `. Musical style: ${config.style}`;
    }
    
    if (config.mood) {
      optimized += `. Emotional mood: ${config.mood}`;
    }
    
    // Add instruments
    if (config.instruments && config.instruments.length > 0) {
      optimized += `. Featured instruments: ${config.instruments.join(', ')}`;
    }
    
    // Add duration
    if (config.duration) {
      optimized += `. Duration: ${config.duration} seconds`;
    }
    
    // Add key signature
    if (config.key) {
      optimized += `. Key signature: ${config.key}`;
    }
    
    console.log('🎼 Optimized ElevenLabs prompt:', optimized);
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

  private async generateDemo(prompt: string, config: MusicGenerationConfig): Promise<GeneratedMusic> {
    console.log('🎼 Generating ElevenLabs demo music...');
    
    // Create a more sophisticated audio demo
    const audioContext = new AudioContext();
    const duration = config.duration || 30;
    const sampleRate = audioContext.sampleRate;
    const frameCount = sampleRate * duration;
    
    const audioBuffer = audioContext.createBuffer(2, frameCount, sampleRate);
    
    // Generate rich musical content based on config
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      
      for (let i = 0; i < frameCount; i++) {
        const time = i / sampleRate;
        let sample = 0;
        
        // Generate music based on instruments and style
        if (config.instruments?.includes('piano') || config.style?.includes('piano')) {
          sample += this.generatePianoSequence(time, config);
        }
        
        if (config.instruments?.includes('strings')) {
          sample += this.generateStrings(time, config) * 0.6;
        }
        
        if (config.instruments?.includes('flute')) {
          sample += this.generateFlute(time, config) * 0.4;
        }
        
        if (config.instruments?.includes('nature sounds')) {
          sample += this.generateNatureSounds(time) * 0.3;
        }
        
        // Add gentle reverb and dynamics
        const envelope = this.generateEnvelope(time, duration);
        sample *= envelope;
        
        // Stereo positioning
        if (channel === 1) {
          sample *= 0.9; // Slight stereo width
        }
        
        channelData[i] = Math.max(-1, Math.min(1, sample));
      }
    }
    
    const audioUrl = await this.bufferToBlob(audioBuffer);
    
    return {
      audioUrl,
      duration,
      format: 'wav',
      metadata: {
        model: 'ElevenLabs-Demo',
        prompt,
        config,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  private generatePianoSequence(time: number, config: MusicGenerationConfig): number {
    const tempo = config.tempo || 90;
    const beatDuration = 60 / tempo;
    
    // Create a gentle piano melody with chords
    const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C major scale
    const chordProgression = [
      [261.63, 329.63, 392.00], // C major
      [293.66, 369.99, 440.00], // D minor
      [329.63, 415.30, 493.88], // E minor
      [349.23, 440.00, 523.25], // F major
    ];
    
    const chordIndex = Math.floor(time / (beatDuration * 4)) % chordProgression.length;
    const chord = chordProgression[chordIndex];
    
    let sample = 0;
    
    // Add melody
    const melodyNote = frequencies[Math.floor(time / beatDuration) % frequencies.length];
    sample += Math.sin(2 * Math.PI * melodyNote * time) * 0.3 * Math.exp(-5 * (time % beatDuration));
    
    // Add chord harmonies
    chord.forEach(freq => {
      sample += Math.sin(2 * Math.PI * freq * time) * 0.15 * Math.exp(-2 * (time % (beatDuration * 4)));
    });
    
    return sample;
  }

  private generateStrings(time: number, config: MusicGenerationConfig): number {
    // Generate warm string sounds
    const fundamentalFreq = 220; // A3
    let sample = 0;
    
    // Add harmonics for rich string timbre
    for (let harmonic = 1; harmonic <= 5; harmonic++) {
      const amplitude = 1 / harmonic * 0.2;
      sample += Math.sin(2 * Math.PI * fundamentalFreq * harmonic * time) * amplitude;
    }
    
    // Add slow vibrato
    const vibrato = Math.sin(2 * Math.PI * 5 * time) * 0.02;
    sample *= (1 + vibrato);
    
    return sample;
  }

  private generateFlute(time: number, config: MusicGenerationConfig): number {
    // Generate breathy flute sounds
    const freq = 523.25; // C5
    const noise = (Math.random() - 0.5) * 0.1;
    const tone = Math.sin(2 * Math.PI * freq * time) * 0.8;
    
    return tone + noise;
  }

  private generateNatureSounds(time: number): number {
    // Generate gentle water and wind sounds
    const noise = (Math.random() - 0.5) * 0.4;
    const filtered = noise * Math.sin(2 * Math.PI * 0.5 * time); // Low-pass effect
    
    return filtered;
  }

  private generateEnvelope(time: number, totalDuration: number): number {
    const fadeInTime = 2;
    const fadeOutTime = 3;
    
    if (time < fadeInTime) {
      return time / fadeInTime;
    } else if (time > totalDuration - fadeOutTime) {
      return (totalDuration - time) / fadeOutTime;
    }
    
    return 1;
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  private async bufferToBlob(buffer: AudioBuffer): Promise<string> {
    const numberOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numberOfChannels * 2; // 16-bit samples
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }
}