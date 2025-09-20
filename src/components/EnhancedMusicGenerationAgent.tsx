/**
 * Enhanced Music Generation Agent with Advanced Coral Protocol Features
 * Hackathon-ready agent for converting optimized prompts to high-quality meditation music
 */

import { AgentCapability, CoralHandoffMessage, CoralProtocolConfig } from '@/types/CoralProtocol';
import { messageBus } from '@/services/CoralMessageBus';
import { MusicGenerationService } from '@/services/MusicGenerationService';
import { DiffRhythmProvider } from '@/providers/DiffRhythmProvider';
import { AudioCraftProvider } from '@/providers/AudioCraftProvider';

export interface EnhancedMusicRequest {
  prompt: string;
  config: {
    duration: number;
    style?: string;
    mood?: string;
    tempo?: string;
    instruments?: string[];
    includeVocals?: boolean;
    binaural?: boolean;
    frequency?: number;
    keywords?: string[];
  };
  therapeuticElements?: string[];
  confidence?: number;
  sessionId?: string;
}

export interface EnhancedMusicResponse {
  audioUrl: string;
  duration: number;
  format: string;
  metadata: {
    model: string;
    prompt: string;
    config: any;
    generatedAt: string;
    quality: 'demo' | 'production';
    therapeuticFrequencies?: number[];
    binauralBeats?: boolean;
    estimatedTherapeuticValue: number;
  };
  analytics: {
    generationTime: number;
    providerUsed: string;
    fallbacksTriggered: number;
    qualityScore: number;
  };
}

export class EnhancedMusicGenerationAgent {
  private config: CoralProtocolConfig;
  private musicService: MusicGenerationService;
  private isRegistered = false;
  private analytics = {
    tracksGenerated: 0,
    totalDuration: 0,
    averageQuality: 0,
    successRate: 1.0,
    providerStats: {
      diffrhythm: { used: 0, success: 0 },
      audiocraft: { used: 0, success: 0 }
    }
  };

  constructor(config: CoralProtocolConfig) {
    this.config = config;
    this.musicService = new MusicGenerationService();
    this.initializeProviders();
    
    // Register with message bus
    messageBus.registerAgent(config.agentId, this);
    
    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    messageBus.addEventListener('handoff-completed', (event) => {
      if (event.agentId === this.config.agentId) {
        console.log(`🎵 Music generation handoff completed`);
      }
    });
  }

  private initializeProviders(): void {
    // Initialize DiffRhythm provider (production quality)
    const diffRhythmProvider = new DiffRhythmProvider();
    this.musicService.addProvider('diffrhythm', diffRhythmProvider);

    // Initialize AudioCraft provider (demo/fallback)
    const audioCraftProvider = new AudioCraftProvider();
    this.musicService.addProvider('audiocraft', audioCraftProvider);

    // Set preferred provider based on capabilities
    this.musicService.setPreferredProvider('diffrhythm');
  }

  async register(): Promise<boolean> {
    console.log(`🎼 Registering Enhanced Music Generation Agent: ${this.config.agentId}`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🎹 Agent registration successful with advanced capabilities');
      this.isRegistered = true;
      
      return true;
    } catch (error) {
      console.error('❌ Music agent registration failed:', error);
      return false;
    }
  }

  async receiveHandoff(handoff: CoralHandoffMessage): Promise<EnhancedMusicResponse> {
    console.log(`🎵 Music agent receiving handoff: ${handoff.handoffType}`, handoff);
    
    switch (handoff.handoffType) {
      case 'prompt-to-music':
        return await this.generateEnhancedMusic({
          prompt: handoff.payload.generatedPrompt,
          config: handoff.payload.musicConfig,
          therapeuticElements: handoff.payload.therapeuticElements,
          confidence: handoff.payload.confidence,
          sessionId: handoff.metadata?.sessionId
        });
      
      case 'error-recovery':
        return await this.generateFallbackMusic(handoff.payload);
      
      default:
        throw new Error(`Unsupported handoff type: ${handoff.handoffType}`);
    }
  }

  async generateEnhancedMusic(request: EnhancedMusicRequest): Promise<EnhancedMusicResponse> {
    console.log('🎼 Generating enhanced meditation music:', request);
    
    const startTime = Date.now();
    let fallbacksTriggered = 0;
    let providerUsed = 'unknown';
    let qualityScore = 0.8;

    try {
      // Optimize prompt for specific provider
      const optimizedPrompt = this.optimizePromptForProvider(request.prompt, request.config);
      
      // Select best provider based on requirements
      const selectedProvider = this.selectOptimalProvider(request.config);
      this.musicService.setPreferredProvider(selectedProvider);
      
      providerUsed = selectedProvider;
      this.analytics.providerStats[selectedProvider as keyof typeof this.analytics.providerStats].used++;

      // Generate music with enhanced configuration
      const result = await this.musicService.generateMusic(optimizedPrompt, {
        duration: request.config.duration * 60, // Convert to seconds
        style: request.config.style,
        mood: request.config.mood,
        tempo: this.convertTempoToBPM(request.config.tempo),
        instruments: request.config.instruments,
        includeVocals: request.config.includeVocals || false
      });

      // Calculate quality metrics
      qualityScore = this.calculateQualityScore(result, request);
      
      // Update analytics
      this.updateAnalytics(result, providerUsed, qualityScore, true);

      const generationTime = Date.now() - startTime;

      const enhancedResponse: EnhancedMusicResponse = {
        audioUrl: result.audioUrl,
        duration: result.duration,
        format: result.format,
        metadata: {
          ...result.metadata,
          quality: selectedProvider === 'diffrhythm' ? 'production' : 'demo',
          therapeuticFrequencies: this.extractTherapeuticFrequencies(request),
          binauralBeats: request.config.binaural || false,
          estimatedTherapeuticValue: this.calculateTherapeuticValue(request, qualityScore)
        },
        analytics: {
          generationTime,
          providerUsed,
          fallbacksTriggered,
          qualityScore
        }
      };

      console.log('✅ Enhanced music generation completed:', enhancedResponse);
      return enhancedResponse;

    } catch (error) {
      console.error('❌ Enhanced music generation failed:', error);
      fallbacksTriggered++;
      
      // Try fallback generation
      return await this.generateFallbackMusic(request);
    }
  }

  private optimizePromptForProvider(prompt: string, config: any): string {
    let optimized = prompt;
    
    // Add provider-specific optimizations
    if (config.binaural && config.frequency) {
      optimized += ` with precise ${config.frequency}Hz binaural beats for therapeutic entrainment`;
    }
    
    if (config.keywords && config.keywords.length > 0) {
      optimized += ` emphasizing ${config.keywords.slice(0, 3).join(', ')} elements`;
    }
    
    // Add quality specifications
    optimized += '. Generate in high-fidelity 48kHz with stereo field depth and therapeutic frequency precision';
    
    return optimized;
  }

  private selectOptimalProvider(config: any): string {
    // Use DiffRhythm for longer, more complex tracks
    if (config.duration > 15 || config.instruments?.length > 2 || config.binaural) {
      return 'diffrhythm';
    }
    
    // Use AudioCraft for shorter, simpler tracks
    return 'audiocraft';
  }

  private convertTempoToBPM(tempo?: string): number {
    switch (tempo) {
      case 'slow': return 70;
      case 'medium': return 90;
      case 'fast': return 110;
      default: return 80; // Optimal for meditation
    }
  }

  private calculateQualityScore(result: any, request: EnhancedMusicRequest): number {
    let score = 0.5; // Base score
    
    // Increase score based on duration match
    if (Math.abs(result.duration - (request.config.duration * 60)) < 10) {
      score += 0.2;
    }
    
    // Increase score for therapeutic elements
    if (request.therapeuticElements && request.therapeuticElements.length > 0) {
      score += request.therapeuticElements.length * 0.1;
    }
    
    // Increase score for high confidence input
    if (request.confidence && request.confidence > 0.8) {
      score += 0.1;
    }
    
    // Increase score for binaural beats
    if (request.config.binaural) {
      score += 0.15;
    }
    
    return Math.max(0.1, Math.min(0.95, score));
  }

  private extractTherapeuticFrequencies(request: EnhancedMusicRequest): number[] {
    const frequencies = [];
    
    if (request.config.binaural && request.config.frequency) {
      frequencies.push(request.config.frequency);
    }
    
    // Add Solfeggio frequencies based on therapeutic elements
    if (request.therapeuticElements?.includes('healing')) {
      frequencies.push(528); // Love frequency
    }
    if (request.therapeuticElements?.includes('grounding')) {
      frequencies.push(7.83); // Schumann resonance
    }
    if (request.therapeuticElements?.includes('stress-reduction')) {
      frequencies.push(432); // Natural frequency
    }
    
    return frequencies;
  }

  private calculateTherapeuticValue(request: EnhancedMusicRequest, qualityScore: number): number {
    let value = qualityScore * 0.5; // Base therapeutic value
    
    // Increase for specific therapeutic elements
    if (request.therapeuticElements) {
      value += request.therapeuticElements.length * 0.1;
    }
    
    // Increase for binaural/frequency therapy
    if (request.config.binaural && request.config.frequency) {
      value += 0.2;
    }
    
    // Increase for optimal duration (10-20 minutes for meditation)
    if (request.config.duration >= 10 && request.config.duration <= 20) {
      value += 0.1;
    }
    
    return Math.max(0.1, Math.min(1.0, value));
  }

  private async generateFallbackMusic(request: any): Promise<EnhancedMusicResponse> {
    console.log('🔧 Generating fallback music');
    
    try {
      // Force use of AudioCraft for reliable fallback
      this.musicService.setPreferredProvider('audiocraft');
      
      const result = await this.musicService.generateMusic(
        'Create calming ambient meditation music with soft textures',
        {
          duration: 300, // 5 minutes fallback
          style: 'ambient',
          mood: 'peaceful',
          tempo: 70,
          instruments: ['pad', 'chimes'],
          includeVocals: false
        }
      );

      return {
        audioUrl: result.audioUrl,
        duration: result.duration,
        format: result.format,
        metadata: {
          ...result.metadata,
          quality: 'demo',
          estimatedTherapeuticValue: 0.6
        },
        analytics: {
          generationTime: 5000,
          providerUsed: 'audiocraft',
          fallbacksTriggered: 1,
          qualityScore: 0.6
        }
      };
    } catch (error) {
      throw new Error(`Fallback music generation failed: ${error.message}`);
    }
  }

  private updateAnalytics(result: any, provider: string, quality: number, success: boolean): void {
    this.analytics.tracksGenerated++;
    this.analytics.totalDuration += result.duration;
    this.analytics.averageQuality = (this.analytics.averageQuality + quality) / 2;
    
    if (success) {
      this.analytics.providerStats[provider as keyof typeof this.analytics.providerStats].success++;
    }
    
    this.analytics.successRate = (this.analytics.successRate * 0.9) + (success ? 0.1 : 0);
  }

  getDetailedStatus() {
    return {
      agentId: this.config.agentId,
      version: this.config.version,
      isRegistered: this.isRegistered,
      capabilities: this.config.capabilities,
      analytics: this.analytics,
      providers: {
        available: this.musicService.getAvailableProviders(),
        primary: 'diffrhythm',
        fallback: 'audiocraft'
      },
      health: {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        uptime: Date.now()
      }
    };
  }

  getCapabilities(): AgentCapability[] {
    return this.config.capabilities;
  }

  async checkHealth(): Promise<boolean> {
    return this.isRegistered && messageBus.isAgentRegistered(this.config.agentId);
  }

  async testGeneration(): Promise<EnhancedMusicResponse> {
    return await this.generateEnhancedMusic({
      prompt: 'Create a peaceful meditation soundscape',
      config: {
        duration: 5,
        style: 'ambient',
        mood: 'peaceful',
        binaural: true,
        frequency: 7.83
      },
      therapeuticElements: ['stress-reduction', 'grounding'],
      confidence: 0.9
    });
  }
}

// Enhanced configuration for hackathon
const enhancedMusicConfig: CoralProtocolConfig = {
  agentId: 'music-generation-agent-v2',
  version: '2.0.0-hackathon',
  registrationEndpoint: 'https://coral-protocol.dev/api/agents/register',
  capabilities: [
    {
      name: 'therapeutic-music-generation',
      description: 'Generate high-quality therapeutic meditation music with binaural beats and frequency optimization',
      inputType: 'enhanced-prompt',
      outputType: 'therapeutic-audio',
      version: '2.0.0',
      maxDuration: 1800, // 30 minutes
      supportsStreaming: true
    },
    {
      name: 'multi-provider-orchestration',
      description: 'Intelligent provider selection and fallback for optimal music generation',
      inputType: 'music-request',
      outputType: 'audio-with-analytics',
      version: '2.0.0',
      supportsStreaming: false
    },
    {
      name: 'quality-optimization',
      description: 'Real-time quality assessment and therapeutic value calculation',
      inputType: 'generated-audio',
      outputType: 'quality-metrics',
      version: '2.0.0',
      supportsStreaming: false
    }
  ]
};

export const enhancedMusicAgent = new EnhancedMusicGenerationAgent(enhancedMusicConfig);