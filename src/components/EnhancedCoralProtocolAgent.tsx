/**
 * Enhanced Coral Protocol Agent with Agent-to-Agent Communication
 * Hackathon-ready features for meditation music prompt generation
 */

import { AgentCapability, AgentRegistration, CoralHandoffMessage, MCPMessage, CoralProtocolConfig } from '@/types/CoralProtocol';
import { messageBus } from '@/services/CoralMessageBus';

export interface MusicPromptConfig {
  duration?: number;
  style?: string;
  mood?: string;
  tempo?: 'slow' | 'medium' | 'fast';
  instruments?: string[];
  includeVocals?: boolean;
  theme?: string;
  intention?: string;
  binaural?: boolean;
  frequency?: number;
  preferredProvider?: string;
}

export interface PromptGenerationResult {
  prompt: string;
  optimizedPrompt: string;
  metadata: {
    confidence: number;
    therapeuticElements: string[];
    suggestedDuration: number;
    estimatedGeneration: number;
    keywords: string[];
  };
}

export class EnhancedCoralProtocolAgent {
  private config: CoralProtocolConfig;
  private isRegistered = false;
  private sessionId: string;
  private analytics = {
    promptsGenerated: 0,
    successRate: 0,
    averageConfidence: 0,
    handoffsCompleted: 0
  };

  constructor(config: CoralProtocolConfig) {
    this.config = config;
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Register with message bus
    messageBus.registerAgent(config.agentId, this);
    
    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    messageBus.addEventListener('handoff-completed', (event) => {
      if (event.agentId === this.config.agentId) {
        this.analytics.handoffsCompleted++;
        console.log(`✅ Handoff completed: ${this.analytics.handoffsCompleted} total`);
      }
    });
  }

  async register(): Promise<boolean> {
    console.log(`🔐 Registering Enhanced Coral Agent: ${this.config.agentId}`);
    
    try {
      // Simulate advanced registration with Coral Protocol
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const registration: AgentRegistration = {
        agentId: this.config.agentId,
        name: 'Meditation Music Prompt Generator',
        version: this.config.version,
        capabilities: this.config.capabilities,
        endpoints: {
          health: `/agents/${this.config.agentId}/health`,
          process: `/agents/${this.config.agentId}/process`,
          handoff: `/agents/${this.config.agentId}/handoff`
        },
        metadata: {
          category: 'wellness-ai',
          tags: ['meditation', 'music', 'wellness', 'therapeutic', 'prompt-generation'],
          description: 'Advanced AI agent for generating therapeutic meditation music prompts with binaural beats and frequency optimization',
          author: 'Coral Protocol Hackathon Team',
          registeredAt: new Date().toISOString()
        }
      };

      console.log('📋 Registration payload:', registration);
      this.isRegistered = true;
      
      return true;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      return false;
    }
  }

  async processRequest(userRequest: string, config: MusicPromptConfig): Promise<PromptGenerationResult> {
    console.log('🧠 Processing advanced prompt request:', { userRequest, config });
    this.analytics.promptsGenerated++;

    // Advanced prompt generation with therapeutic optimization
    const therapeuticElements = this.extractTherapeuticElements(userRequest, config);
    const optimizedPrompt = this.generateTherapeuticPrompt(userRequest, config, therapeuticElements);
    
    // Calculate confidence based on multiple factors
    const confidence = this.calculateConfidence(userRequest, config, therapeuticElements);
    
    // Extract keywords for better music generation
    const keywords = this.extractMusicKeywords(userRequest, config);
    
    const result: PromptGenerationResult = {
      prompt: userRequest,
      optimizedPrompt,
      metadata: {
        confidence,
        therapeuticElements,
        suggestedDuration: this.calculateOptimalDuration(config),
        estimatedGeneration: this.estimateGenerationTime(config),
        keywords
      }
    };

    // Update analytics
    this.analytics.averageConfidence = (this.analytics.averageConfidence + confidence) / 2;
    this.analytics.successRate = confidence > 0.7 ? this.analytics.successRate + 0.1 : this.analytics.successRate - 0.05;
    this.analytics.successRate = Math.max(0, Math.min(1, this.analytics.successRate));

    return result;
  }

  async receiveHandoff(handoff: CoralHandoffMessage): Promise<any> {
    console.log(`🔄 Receiving handoff: ${handoff.handoffType}`, handoff);
    
    switch (handoff.handoffType) {
      case 'prompt-to-music':
        // This agent generates prompts, so this would be incoming refined requirements
        return await this.processRequest(handoff.payload.userRequest, handoff.payload.musicConfig);
      
      case 'error-recovery':
        // Handle error recovery by regenerating prompt with fallback strategy
        return await this.generateFallbackPrompt(handoff.payload);
      
      case 'status-update':
        // Return current agent status
        return this.getDetailedStatus();
      
      default:
        throw new Error(`Unsupported handoff type: ${handoff.handoffType}`);
    }
  }

  async initiateHandoffToMusicAgent(promptResult: PromptGenerationResult, musicConfig: MusicPromptConfig): Promise<any> {
    console.log('🎵 Initiating handoff to music generation agent');
    
    const handoff = messageBus.createHandoffMessage(
      this.config.agentId,
      'music-generation-agent-v2',
      'prompt-to-music',
      {
        generatedPrompt: promptResult.optimizedPrompt,
        musicConfig: {
          ...musicConfig,
          duration: promptResult.metadata.suggestedDuration,
          keywords: promptResult.metadata.keywords
        },
        confidence: promptResult.metadata.confidence,
        therapeuticElements: promptResult.metadata.therapeuticElements
      },
      this.sessionId
    );

    return await messageBus.sendHandoff(handoff);
  }

  private extractTherapeuticElements(userRequest: string, config: MusicPromptConfig): string[] {
    const elements = [];
    const request = userRequest.toLowerCase();
    
    // Emotional states
    if (request.includes('stress') || request.includes('anxiety')) elements.push('stress-reduction');
    if (request.includes('sleep') || request.includes('insomnia')) elements.push('sleep-induction');
    if (request.includes('focus') || request.includes('concentration')) elements.push('cognitive-enhancement');
    if (request.includes('pain') || request.includes('healing')) elements.push('pain-relief');
    if (request.includes('energy') || request.includes('motivation')) elements.push('energy-boost');
    
    // Binaural frequencies
    if (config.binaural) {
      if (config.frequency && config.frequency <= 8) elements.push('delta-waves');
      else if (config.frequency && config.frequency <= 13) elements.push('alpha-waves');
      else if (config.frequency && config.frequency <= 30) elements.push('beta-waves');
      else elements.push('theta-waves');
    }
    
    // Musical therapy elements
    if (config.instruments?.includes('singing bowl')) elements.push('tibetan-healing');
    if (config.instruments?.includes('chimes')) elements.push('crystal-therapy');
    if (config.style?.includes('nature')) elements.push('nature-therapy');
    
    return elements;
  }

  private generateTherapeuticPrompt(userRequest: string, config: MusicPromptConfig, therapeuticElements: string[]): string {
    let prompt = userRequest;
    
    // Preserve original musical intent first
    let musicalElements = [];
    
    // Add duration and structure
    const duration = config.duration || 10;
    prompt += `. Create a ${duration}-minute composition`;
    
    // Add instrumental specifications FIRST - this is crucial
    if (config.instruments && config.instruments.length > 0) {
      const instruments = config.instruments.join(', ');
      prompt += ` featuring ${instruments} with clear, distinct musical tones and natural playing techniques`;
      musicalElements.push(`instruments: ${instruments}`);
    }
    
    // Add mood and tempo specifications
    if (config.mood) {
      prompt += `. Maintain a ${config.mood} emotional tone throughout`;
    }
    
    if (config.tempo) {
      const bpm = config.tempo === 'slow' ? '60-80' : config.tempo === 'medium' ? '80-100' : '100-120';
      prompt += `. Keep tempo around ${bpm} BPM`;
      musicalElements.push(`tempo: ${bpm} BPM`);
    }

    // Add musical style and structure
    if (config.style) {
      prompt += ` in ${config.style} style with organic, flowing musical phrases`;
    }
    
    // Only THEN add therapeutic enhancements as subtle background elements
    if (therapeuticElements.includes('stress-reduction')) {
      prompt += '. Subtly incorporate calming 432Hz tuning for therapeutic effect';
    }
    
    if (therapeuticElements.includes('sleep-induction')) {
      prompt += '. Use gradually slowing rhythmic patterns to support relaxation';
    }
    
    // Make binaural beats SUBTLE and not dominant
    if (config.binaural && config.frequency) {
      prompt += `. Add gentle ${config.frequency}Hz binaural undertones beneath the main musical content`;
    }

    return prompt;
  }

  private calculateConfidence(userRequest: string, config: MusicPromptConfig, therapeuticElements: string[]): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on specific therapeutic elements
    confidence += therapeuticElements.length * 0.1;
    
    // Increase confidence for well-defined requests
    if (config.duration && config.duration > 0) confidence += 0.1;
    if (config.style) confidence += 0.1;
    if (config.mood) confidence += 0.1;
    if (config.instruments && config.instruments.length > 0) confidence += 0.1;
    
    // Increase confidence for binaural/frequency specifications
    if (config.binaural && config.frequency) confidence += 0.15;
    
    // Penalize overly complex or vague requests
    if (userRequest.length < 10) confidence -= 0.2;
    if (userRequest.length > 200) confidence -= 0.1;
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  private extractMusicKeywords(userRequest: string, config: MusicPromptConfig): string[] {
    const keywords = [];
    const request = userRequest.toLowerCase();
    
    // Extract emotional keywords
    const emotions = ['calm', 'peaceful', 'energetic', 'soothing', 'uplifting', 'grounding', 'healing'];
    emotions.forEach(emotion => {
      if (request.includes(emotion)) keywords.push(emotion);
    });
    
    // Extract environmental keywords
    const environments = ['ocean', 'forest', 'mountain', 'space', 'cave', 'garden', 'rain'];
    environments.forEach(env => {
      if (request.includes(env)) keywords.push(env);
    });
    
    // Add config-based keywords
    if (config.style) keywords.push(config.style);
    if (config.mood) keywords.push(config.mood);
    if (config.instruments) keywords.push(...config.instruments);
    
    return [...new Set(keywords)]; // Remove duplicates
  }

  private calculateOptimalDuration(config: MusicPromptConfig): number {
    if (config.duration) return config.duration;
    
    // Suggest optimal duration based on use case
    if (config.style?.includes('sleep')) return 30; // Sleep music should be longer
    if (config.style?.includes('focus')) return 15; // Focus music medium length
    if (config.style?.includes('energy')) return 5; // Energy music shorter and intense
    
    return 10; // Default
  }

  private estimateGenerationTime(config: MusicPromptConfig): number {
    const baseDuration = config.duration || 10;
    const complexity = (config.instruments?.length || 1) * (config.binaural ? 1.5 : 1);
    return Math.ceil(baseDuration * complexity * 0.3); // Estimate in seconds
  }

  private async generateFallbackPrompt(errorPayload: any): Promise<PromptGenerationResult> {
    console.log('🔧 Generating fallback prompt for error recovery');
    
    return {
      prompt: 'Create calming meditation music',
      optimizedPrompt: 'Generate a 10-minute ambient meditation track with soft pad sounds, gentle nature background, and 7.83Hz Schumann resonance for grounding and relaxation',
      metadata: {
        confidence: 0.8,
        therapeuticElements: ['stress-reduction', 'grounding'],
        suggestedDuration: 10,
        estimatedGeneration: 30,
        keywords: ['ambient', 'calming', 'meditation', 'grounding']
      }
    };
  }

  getDetailedStatus() {
    return {
      agentId: this.config.agentId,
      version: this.config.version,
      isRegistered: this.isRegistered,
      capabilities: this.config.capabilities,
      sessionId: this.sessionId,
      analytics: this.analytics,
      health: {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        uptime: Date.now(),
        memoryUsage: (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        } : null
      },
      coral: {
        messagesSent: this.analytics.handoffsCompleted,
        successRate: this.analytics.successRate,
        averageResponseTime: 0.8 // Mock response time
      }
    };
  }

  getCapabilities(): AgentCapability[] {
    return this.config.capabilities;
  }

  async checkHealth(): Promise<boolean> {
    return this.isRegistered && messageBus.isAgentRegistered(this.config.agentId);
  }
}

// Enhanced agent configuration for hackathon
const enhancedConfig: CoralProtocolConfig = {
  agentId: 'meditation-music-generator-v2',
  version: '2.0.0-hackathon',
  registrationEndpoint: 'https://coral-protocol.dev/api/agents/register',
  capabilities: [
    {
      name: 'therapeutic-prompt-generation',
      description: 'Generate optimized prompts for therapeutic meditation music with binaural beats',
      inputType: 'text+config',
      outputType: 'enhanced-prompt',
      version: '2.0.0',
      supportsStreaming: false
    },
    {
      name: 'binaural-optimization',
      description: 'Optimize prompts for specific brainwave frequencies and therapeutic outcomes',
      inputType: 'prompt+frequency',
      outputType: 'optimized-prompt',
      version: '2.0.0',
      supportsStreaming: false
    },
    {
      name: 'agent-handoff',
      description: 'Seamless handoff to music generation agents with context preservation',
      inputType: 'prompt-result',
      outputType: 'music-request',
      version: '2.0.0',
      supportsStreaming: true
    }
  ]
};

export const enhancedMeditationAgent = new EnhancedCoralProtocolAgent(enhancedConfig);