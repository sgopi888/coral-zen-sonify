import { MusicProvider, MusicGenerationConfig, GeneratedMusic } from '../services/MusicGenerationService';

export class DiffRhythmProvider implements MusicProvider {
  name = 'DiffRhythm';
  maxDuration = 285; // 285 seconds max for DiffRhythm
  supportsVocals = true;

  private apiEndpoint = 'https://fal.ai/api/v1/models/fal-ai/diffrhythm';
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }

  async checkHealth(): Promise<boolean> {
    try {
      // For demo purposes, we'll simulate the health check
      console.log('🔍 Checking DiffRhythm health...');
      return true; // In production, make actual API health check
    } catch {
      return false;
    }
  }

  async generateMusic(prompt: string, config: MusicGenerationConfig): Promise<GeneratedMusic> {
    console.log('🎼 DiffRhythm generating:', prompt);
    
    // Optimize prompt for DiffRhythm
    const optimizedPrompt = this.optimizePromptForMeditation(prompt, config);
    
    if (this.apiKey) {
      return await this.generateWithAPI(optimizedPrompt, config);
    } else {
      return await this.generateDemo(optimizedPrompt, config);
    }
  }

  private optimizePromptForMeditation(prompt: string, config: MusicGenerationConfig): string {
    const duration = Math.min(config.duration || 60, this.maxDuration);
    const style = config.style || 'ambient meditation';
    const tempo = config.tempo || 70;
    
    return `${style}, ${tempo} BPM, ${duration} seconds duration, ${prompt}. Soft, flowing, meditative, minimal percussion, sustained tones, gradual harmonic progression`;
  }

  private async generateWithAPI(prompt: string, config: MusicGenerationConfig): Promise<GeneratedMusic> {
    if (!this.apiKey) throw new Error('DiffRhythm API key required');
    
    console.log('🌐 Using DiffRhythm API...');
    
    const payload = {
      text_prompt: prompt,
      duration: Math.min(config.duration || 60, this.maxDuration),
      include_vocals: config.includeVocals || false,
      style: config.style || 'ambient meditation'
    };

    // Simulate API call for now
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      audioUrl: 'blob:meditation-track-diffrhythm.mp3', // Placeholder
      duration: payload.duration,
      format: 'mp3',
      metadata: {
        model: 'DiffRhythm-v1.2',
        prompt,
        config,
        generatedAt: new Date().toISOString()
      }
    };
  }

  private async generateDemo(prompt: string, config: MusicGenerationConfig): Promise<GeneratedMusic> {
    console.log('🎭 DiffRhythm demo mode - generating meditation music simulation');
    
    // Simulate generation time based on duration
    const duration = Math.min(config.duration || 60, 120); // Demo limited to 2 minutes
    const simulationTime = Math.min(duration * 50, 5000); // Max 5s simulation
    
    await new Promise(resolve => setTimeout(resolve, simulationTime));
    
    // Create a simple meditation tone as demo
    const audioContext = new AudioContext();
    const buffer = audioContext.createBuffer(2, audioContext.sampleRate * duration, audioContext.sampleRate);
    
    // Generate calming sine waves at meditation frequencies
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        // Layer multiple frequencies for richness
        const t = i / audioContext.sampleRate;
        const freq1 = 256; // C4 - Root chakra frequency
        const freq2 = 341.3; // F4 - Heart chakra frequency  
        const freq3 = 426.7; // Ab4 - Solar plexus frequency
        
        channelData[i] = 
          0.2 * Math.sin(2 * Math.PI * freq1 * t) * Math.exp(-t / (duration * 0.8)) +
          0.15 * Math.sin(2 * Math.PI * freq2 * t) * Math.exp(-t / (duration * 0.9)) +
          0.1 * Math.sin(2 * Math.PI * freq3 * t) * Math.exp(-t / duration);
      }
    }
    
    // Convert to blob URL
    const audioUrl = await this.bufferToBlob(buffer);
    
    return {
      audioUrl,
      duration,
      format: 'wav',
      metadata: {
        model: 'DiffRhythm-Demo',
        prompt,
        config,
        generatedAt: new Date().toISOString()
      }
    };
  }

  private async bufferToBlob(buffer: AudioBuffer): Promise<string> {
    // Convert AudioBuffer to Blob and return URL
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    
    // Create WAV file
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
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
    
    // Convert float32 to int16
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