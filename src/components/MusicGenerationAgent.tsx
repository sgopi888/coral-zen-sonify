import React from 'react';
import { MusicGenerationService } from '../services/MusicGenerationService';
import { DiffRhythmProvider } from '../providers/DiffRhythmProvider';
import { AudioCraftProvider } from '../providers/AudioCraftProvider';

/**
 * Music Generation MCP Agent
 * 
 * Receives text prompts from the Meditation Prompt Agent
 * and generates actual MP3 files using AI music generation models
 */

export interface MusicGenerationAgentConfig {
  agentId: string;
  version: string;
  capabilities: string[];
  preferredProvider?: string;
  apiKeys?: {
    diffrhythm?: string;
    audiocraft?: string;
  };
}

export interface MusicGenerationRequest {
  id: string;
  textPrompt: string;
  musicConfig: {
    duration: number;
    style: string;
    tempo: number;
    key: string;
    mood: string;
    instruments: string[];
    includeVocals?: boolean;
  };
  timestamp: string;
}

export interface MusicGenerationResponse {
  id: string;
  audioUrl: string;
  duration: number;
  format: string;
  metadata: any;
  generationTime: number;
  model: string;
}

export class MusicGenerationAgent {
  private config: MusicGenerationAgentConfig;
  private musicService: MusicGenerationService;
  private isRegistered: boolean = false;

  constructor(config: MusicGenerationAgentConfig) {
    this.config = {
      agentId: 'music-generation-agent-v1',
      version: '1.0.0',
      capabilities: [
        'diffrhythm-full-song-generation',
        'audiocraft-ambient-generation', 
        'meditation-music-optimization',
        'multi-format-audio-export'
      ],
      ...config
    };

    this.musicService = new MusicGenerationService();
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize DiffRhythm provider
    const diffRhythmProvider = new DiffRhythmProvider(this.config.apiKeys?.diffrhythm);
    this.musicService.addProvider('diffrhythm', diffRhythmProvider);

    // Initialize AudioCraft provider as fallback
    const audioCraftProvider = new AudioCraftProvider();
    this.musicService.addProvider('audiocraft', audioCraftProvider);

    // Set preferred provider if specified
    if (this.config.preferredProvider) {
      this.musicService.setPreferredProvider(this.config.preferredProvider);
    }
  }

  /**
   * Register with Coral Protocol as Music Generation Agent
   */
  async register(): Promise<boolean> {
    console.log('🎵 Registering Music Generation Agent with Coral Protocol...');
    console.log('🤖 Agent ID:', this.config.agentId);
    console.log('🔧 Capabilities:', this.config.capabilities);

    try {
      const registrationPayload = {
        agentId: this.config.agentId,
        version: this.config.version,
        capabilities: this.config.capabilities,
        metadata: {
          type: 'music-generation-agent',
          category: 'audio-synthesis',
          description: 'Converts meditation music prompts to actual audio files using AI models',
          supportedModels: this.musicService.getAvailableProviders(),
          maxDuration: 285, // DiffRhythm max
          audioFormats: ['mp3', 'wav', 'ogg'],
          compliance: ['therapeutic-audio-standards', 'meditation-optimized']
        },
        timestamp: new Date().toISOString()
      };

      // Simulate Coral Protocol registration
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('✅ Music Generation Agent registered with Coral Protocol');
      console.log('📝 Registration payload:', registrationPayload);
      
      this.isRegistered = true;
      return true;
    } catch (error) {
      console.error('❌ Music Generation Agent registration failed:', error);
      return false;
    }
  }

  /**
   * Process music generation request from Prompt Agent
   */
  async generateMusic(request: MusicGenerationRequest): Promise<MusicGenerationResponse> {
    if (!this.isRegistered) {
      throw new Error('Music Generation Agent not registered with Coral Protocol');
    }

    console.log('🎼 Processing music generation request:', request.id);
    
    const startTime = Date.now();
    
    try {
      const generatedMusic = await this.musicService.generateMusic(
        request.textPrompt,
        {
          duration: request.musicConfig.duration,
          style: request.musicConfig.style,
          mood: request.musicConfig.mood,
          tempo: request.musicConfig.tempo,
          key: request.musicConfig.key,
          instruments: request.musicConfig.instruments,
          includeVocals: request.musicConfig.includeVocals
        }
      );

      const generationTime = Date.now() - startTime;

      const response: MusicGenerationResponse = {
        id: request.id,
        audioUrl: generatedMusic.audioUrl,
        duration: generatedMusic.duration,
        format: generatedMusic.format,
        metadata: {
          ...generatedMusic.metadata,
          originalRequest: request,
          coralProtocolAgent: this.config.agentId
        },
        generationTime,
        model: generatedMusic.metadata.model
      };

      console.log('✅ Music generation completed in', generationTime, 'ms');
      return response;

    } catch (error) {
      console.error('❌ Music generation failed:', error);
      throw error;
    }
  }

  /**
   * Get agent status and available providers
   */
  getStatus() {
    return {
      isRegistered: this.isRegistered,
      agentId: this.config.agentId,
      version: this.config.version,
      capabilities: this.config.capabilities,
      availableProviders: this.musicService.getAvailableProviders(),
      lastHeartbeat: new Date().toISOString()
    };
  }

  /**
   * Test generation with sample meditation prompt
   */
  async testGeneration(): Promise<MusicGenerationResponse> {
    const testRequest: MusicGenerationRequest = {
      id: `test-${Date.now()}`,
      textPrompt: `MEDITATION MUSIC PROMPT:
Generate a 60-second meditation soundscape in C major at 70 BPM. Create a peaceful composition featuring soft ambient pads, gentle nature sounds, and distant singing bowls. The music should evoke deep relaxation and mindfulness, with seamless flow and minimal melodic movement.

TECHNICAL SPECIFICATIONS:
- Duration: 60 seconds
- Tempo: 70 BPM  
- Key: C major
- Fade-in: 10 seconds, Fade-out: 10 seconds

ATMOSPHERIC ELEMENTS:
- Spatial: Serene temple space with natural reverb
- Texture: Smooth, flowing, ethereal
- Volume dynamics: Consistent with gentle swells`,
      musicConfig: {
        duration: 60,
        style: 'ambient meditation',
        tempo: 70,
        key: 'C major',
        mood: 'peaceful',
        instruments: ['ambient pads', 'singing bowls', 'nature sounds'],
        includeVocals: false
      },
      timestamp: new Date().toISOString()
    };

    return await this.generateMusic(testRequest);
  }
}

// Singleton instance for the music generation agent
export const musicGenerationAgent = new MusicGenerationAgent({
  agentId: 'music-generation-agent-v1',
  version: '1.0.0',
  capabilities: [
    'diffrhythm-full-song-generation',
    'audiocraft-ambient-generation',
    'meditation-music-optimization', 
    'multi-format-audio-export'
  ]
});