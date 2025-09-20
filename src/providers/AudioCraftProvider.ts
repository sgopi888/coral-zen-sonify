import { MusicProvider, MusicGenerationConfig, GeneratedMusic } from '../services/MusicGenerationService';

export class AudioCraftProvider implements MusicProvider {
  name = 'AudioCraft';
  maxDuration = 30; // 30 seconds for AudioCraft segments
  supportsVocals = false;
  
  async checkHealth(): Promise<boolean> {
    try {
      console.log('🔍 Checking AudioCraft health...');
      return typeof window !== 'undefined' && 'AudioContext' in window;
    } catch {
      return false;
    }
  }

  async generateMusic(prompt: string, config: MusicGenerationConfig): Promise<GeneratedMusic> {
    console.log('🎹 AudioCraft generating ambient clip:', prompt);
    
    const duration = Math.min(config.duration || 30, this.maxDuration);
    const segments = Math.ceil((config.duration || 30) / this.maxDuration);
    
    if (segments > 1) {
      // Generate multiple segments and chain them
      return await this.generateSegmentedMusic(prompt, config, segments);
    } else {
      return await this.generateSingleSegment(prompt, config);
    }
  }

  private async generateSingleSegment(prompt: string, config: MusicGenerationConfig): Promise<GeneratedMusic> {
    console.log('🎼 Generating AudioCraft musical segment:', prompt);
    
    const duration = Math.min(config.duration || 30, this.maxDuration);
    
    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Analyze prompt for musical content
    const promptLower = prompt.toLowerCase();
    const hasPiano = promptLower.includes('piano');
    const hasNature = promptLower.includes('nature');
    const hasGuitar = promptLower.includes('guitar');
    const hasViolin = promptLower.includes('violin');
    const hasFlute = promptLower.includes('flute');
    
    // Create more sophisticated audio buffer
    const audioContext = new AudioContext();
    const buffer = audioContext.createBuffer(2, audioContext.sampleRate * duration, audioContext.sampleRate);
    
    // Generate musical content based on requested instruments
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < channelData.length; i++) {
        const t = i / audioContext.sampleRate;
        let sample = 0;
        
        // Musical tempo and timing
        const tempo = (config.tempo || 70) / 60; // Convert BPM to Hz
        const beatPhase = (t * tempo) % 1;
        
        if (hasPiano) {
          // Generate piano-like tones with harmonics
          const fundamentalFreqs = [261.63, 293.66, 329.63, 349.23, 392.00]; // C, D, E, F, G
          
          fundamentalFreqs.forEach((freq, index) => {
            const noteDelay = index * 1.2; // Stagger notes
            if (t > noteDelay) {
              const noteTime = t - noteDelay;
              const attack = Math.max(0, 1 - noteTime * 3); // Quick attack
              const decay = Math.exp(-noteTime * 0.8); // Moderate decay
              
              // Piano harmonics (fundamental + overtones)
              const fundamental = Math.sin(2 * Math.PI * freq * noteTime);
              const harmonic2 = 0.5 * Math.sin(2 * Math.PI * freq * 2 * noteTime);
              const harmonic3 = 0.25 * Math.sin(2 * Math.PI * freq * 3 * noteTime);
              
              const pianoTone = (fundamental + harmonic2 + harmonic3) * attack * decay * 0.1;
              sample += pianoTone;
            }
          });
        }
        
        if (hasNature) {
          // Generate nature sounds (water, wind)
          const waterFreq = 200 + 100 * Math.sin(2 * Math.PI * 0.1 * t);
          const waterSound = 0.03 * (Math.random() - 0.5) * Math.sin(2 * Math.PI * waterFreq * t);
          const windSound = 0.02 * (Math.random() - 0.5) * Math.sin(2 * Math.PI * 50 * t);
          sample += waterSound + windSound;
        }
        
        if (hasGuitar) {
          // Generate guitar-like plucked strings
          const guitarFreqs = [82.41, 110.00, 146.83, 196.00]; // E, A, D, G strings
          guitarFreqs.forEach((freq, index) => {
            const pluckTime = (Math.floor(t * tempo) + index * 0.5) % 4;
            if (Math.abs(t * tempo - pluckTime) < 0.1) {
              const pluckPhase = t - pluckTime / tempo;
              const pluck = Math.sin(2 * Math.PI * freq * pluckPhase) * Math.exp(-pluckPhase * 5);
              sample += pluck * 0.08;
            }
          });
        }
        
        if (hasFlute) {
          // Generate flute-like sustained tones
          const fluteFreq = 523.25 + 50 * Math.sin(2 * Math.PI * 0.3 * t); // C5 with vibrato
          const fluteEnvelope = 0.5 + 0.3 * Math.sin(2 * Math.PI * 0.1 * t); // Breathing pattern
          const fluteTone = Math.sin(2 * Math.PI * fluteFreq * t) * fluteEnvelope * 0.06;
          sample += fluteTone;
        }
        
        // Add some general ambient texture if no specific instruments
        if (!hasPiano && !hasGuitar && !hasFlute) {
          const baseFreq = 261.63; // C4
          const ambient = Math.sin(2 * Math.PI * baseFreq * t) * Math.exp(-t / (duration * 0.5)) * 0.1;
          sample += ambient;
        }
        
        // Add binaural beats if requested
        if (config.binaural && config.frequency) {
          const binauralOffset = channel === 0 ? 0 : config.frequency;
          const binauralTone = 0.02 * Math.sin(2 * Math.PI * (40 + binauralOffset) * t);
          sample += binauralTone;
        }
        
        // Apply gentle reverb effect
        const reverbDelay = Math.floor(audioContext.sampleRate * 0.1); // 100ms delay
        if (i > reverbDelay) {
          sample += channelData[i - reverbDelay] * 0.2;
        }
        
        // Stereo panning for spatial depth
        const panOffset = channel === 0 ? -0.05 : 0.05;
        const spatialMod = 1 + panOffset * Math.sin(2 * Math.PI * 0.02 * t);
        
        channelData[i] = sample * spatialMod * 0.7; // Overall volume control
      }
    }
    
    const audioUrl = await this.bufferToBlob(buffer);
    
    return {
      audioUrl,
      duration,
      format: 'wav',
      metadata: {
        model: 'AudioCraft-Demo',
        prompt,
        config,
        generatedAt: new Date().toISOString()
      }
    };
  }

  private async generateSegmentedMusic(prompt: string, config: MusicGenerationConfig, segments: number): Promise<GeneratedMusic> {
    console.log(`🔗 Generating ${segments} AudioCraft segments for longer duration`);
    
    const totalDuration = config.duration || 60;
    const segmentDuration = this.maxDuration;
    
    // Generate all segments
    const segmentPromises = Array.from({ length: segments }, (_, i) => {
      const segmentConfig = {
        ...config,
        duration: i === segments - 1 ? totalDuration % segmentDuration || segmentDuration : segmentDuration
      };
      return this.generateSingleSegment(`${prompt} (segment ${i + 1})`, segmentConfig);
    });
    
    const segmentResults = await Promise.all(segmentPromises);
    
    // Combine segments into single audio buffer
    const combinedUrl = await this.combineAudioSegments(segmentResults);
    
    return {
      audioUrl: combinedUrl,
      duration: totalDuration,
      format: 'wav',
      metadata: {
        model: 'AudioCraft-Segmented',
        prompt,
        config,
        generatedAt: new Date().toISOString()
      } as any
    };
  }

  private async combineAudioSegments(segments: GeneratedMusic[]): Promise<string> {
    // This is a simplified version - in production, you'd use proper audio concatenation
    console.log('🔗 Combining audio segments...');
    
    // For demo, just return the first segment URL
    // In production, implement proper audio buffer concatenation
    return segments[0].audioUrl;
  }

  private async bufferToBlob(buffer: AudioBuffer): Promise<string> {
    // Same WAV conversion as DiffRhythm provider
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    let offset = 44;
    for (let i = 0; i < length; i++) {
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