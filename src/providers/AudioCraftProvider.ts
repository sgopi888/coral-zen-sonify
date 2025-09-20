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
    console.log('🎼 Generating AudioCraft ambient meditation segment');
    
    const duration = Math.min(config.duration || 30, this.maxDuration);
    
    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create ambient meditation soundscape
    const audioContext = new AudioContext();
    const buffer = audioContext.createBuffer(2, audioContext.sampleRate * duration, audioContext.sampleRate);
    
    // Generate ambient textures
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < channelData.length; i++) {
        const t = i / audioContext.sampleRate;
        
        // Base meditation frequencies with gentle modulation
        const baseFreq = config.key === 'C' ? 261.63 : 293.66; // C4 or D4
        const tempo = (config.tempo || 60) / 60; // Convert BPM to Hz
        
        // Create layered ambient texture
        const carrier = Math.sin(2 * Math.PI * baseFreq * t);
        const modulator = 0.3 * Math.sin(2 * Math.PI * tempo * 0.1 * t); // Slow modulation
        const noise = (Math.random() - 0.5) * 0.05; // Gentle noise texture
        const envelope = Math.exp(-t / (duration * 0.7)); // Gradual fade
        
        // Stereo panning for spatial depth
        const panOffset = channel === 0 ? -0.1 : 0.1;
        const spatialMod = Math.sin(2 * Math.PI * 0.05 * t + panOffset);
        
        channelData[i] = (carrier * (1 + modulator) + noise) * envelope * spatialMod * 0.15;
        
        // Add harmonic content for richness
        if (config.instruments?.includes('singing bowls')) {
          const bowlFreq = baseFreq * 1.5;
          const bowlTone = 0.1 * Math.sin(2 * Math.PI * bowlFreq * t) * Math.exp(-t / (duration * 0.5));
          channelData[i] += bowlTone;
        }
        
        if (config.instruments?.includes('nature sounds')) {
          // Simulate gentle water/wind sounds
          const natureTone = 0.05 * (Math.random() - 0.5) * Math.sin(2 * Math.PI * 800 * t);
          channelData[i] += natureTone * Math.sin(2 * Math.PI * 0.02 * t);
        }
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