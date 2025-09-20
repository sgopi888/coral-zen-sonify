/**
 * Modular Music Generation Service Interface
 * Supports multiple AI music generation providers
 */

export interface MusicGenerationConfig {
  duration?: number; // seconds (up to 285 for DiffRhythm)
  style?: string;
  mood?: string;
  tempo?: number;
  key?: string;
  instruments?: string[];
  includeVocals?: boolean;
  binaural?: boolean;
  frequency?: number;
}

export interface GeneratedMusic {
  audioUrl: string;
  duration: number;
  format: string;
  metadata: {
    model: string;
    prompt: string;
    config: MusicGenerationConfig;
    generatedAt: string;
  };
}

export interface MusicProvider {
  name: string;
  maxDuration: number; // seconds
  supportsVocals: boolean;
  generateMusic(prompt: string, config: MusicGenerationConfig): Promise<GeneratedMusic>;
  checkHealth(): Promise<boolean>;
}

export class MusicGenerationService {
  private providers: Map<string, MusicProvider> = new Map();
  private primaryProvider: string = 'diffrhythm';
  private fallbackProvider: string = 'audiocraft';

  addProvider(name: string, provider: MusicProvider) {
    this.providers.set(name, provider);
  }

  async generateMusic(prompt: string, config: MusicGenerationConfig): Promise<GeneratedMusic> {
    console.log('🎵 Generating music with config:', config);
    
    // Try primary provider first
    try {
      const primaryProvider = this.providers.get(this.primaryProvider);
      if (primaryProvider && await primaryProvider.checkHealth()) {
        console.log(`✅ Using ${this.primaryProvider} for music generation`);
        return await primaryProvider.generateMusic(prompt, config);
      }
    } catch (error) {
      console.warn(`❌ ${this.primaryProvider} failed:`, error);
    }

    // Fallback to secondary provider
    try {
      const fallbackProvider = this.providers.get(this.fallbackProvider);
      if (fallbackProvider && await fallbackProvider.checkHealth()) {
        console.log(`🔄 Falling back to ${this.fallbackProvider}`);
        return await fallbackProvider.generateMusic(prompt, config);
      }
    } catch (error) {
      console.error(`❌ ${this.fallbackProvider} also failed:`, error);
    }

    throw new Error('All music generation providers are unavailable');
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  setPreferredProvider(providerName: string) {
    if (this.providers.has(providerName)) {
      this.primaryProvider = providerName;
    }
  }
}