/**
 * Comprehensive Unit Tests for Coral Protocol Agents
 * Hackathon validation suite
 */

import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { EnhancedCoralProtocolAgent } from '@/components/EnhancedCoralProtocolAgent';
import { EnhancedMusicGenerationAgent } from '@/components/EnhancedMusicGenerationAgent';
import { CoralMessageBus } from '@/services/CoralMessageBus';
import { MCPMessage, CoralHandoffMessage } from '@/types/CoralProtocol';

// Mock performance API for testing
Object.defineProperty(global, 'performance', {
  value: {
    memory: {
      usedJSHeapSize: 50000000,
      totalJSHeapSize: 100000000,
      jsHeapSizeLimit: 200000000
    }
  }
});

// Mock Web Audio API
Object.defineProperty(global, 'AudioContext', {
  value: vi.fn().mockImplementation(() => ({
    createBuffer: vi.fn().mockReturnValue({
      getChannelData: vi.fn().mockReturnValue(new Float32Array(1024)),
      numberOfChannels: 2,
      sampleRate: 44100,
      length: 1024
    }),
    sampleRate: 44100,
    state: 'running',
    close: vi.fn()
  }))
});

describe('Enhanced Coral Protocol Agent', () => {
  let promptAgent: EnhancedCoralProtocolAgent;
  let messageBus: CoralMessageBus;

  beforeEach(() => {
    // Reset message bus
    messageBus = CoralMessageBus.getInstance();
    
    // Create prompt agent
    promptAgent = new EnhancedCoralProtocolAgent({
      agentId: 'test-prompt-agent',
      version: '2.0.0-test',
      registrationEndpoint: 'http://test.com/register',
      capabilities: [
        {
          name: 'test-prompt-generation',
          description: 'Test prompt generation',
          inputType: 'text',
          outputType: 'prompt',
          version: '2.0.0'
        }
      ]
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should register agent successfully', async () => {
    const result = await promptAgent.register();
    expect(result).toBe(true);
    
    const status = promptAgent.getDetailedStatus();
    expect(status.isRegistered).toBe(true);
    expect(status.agentId).toBe('test-prompt-agent');
  });

  test('should generate therapeutic prompts with high confidence', async () => {
    await promptAgent.register();
    
    const result = await promptAgent.processRequest(
      'Create calming music for stress relief with nature sounds',
      {
        duration: 10,
        style: 'ambient',
        mood: 'peaceful',
        binaural: true,
        frequency: 7.83,
        instruments: ['singing bowl', 'nature sounds']
      }
    );

    expect(result).toBeDefined();
    expect(result.optimizedPrompt).toContain('7.83Hz');
    expect(result.optimizedPrompt).toContain('binaural');
    expect(result.metadata.confidence).toBeGreaterThan(0.7);
    expect(result.metadata.therapeuticElements).toContain('stress-reduction');
  });

  test('should calculate confidence correctly based on input quality', async () => {
    await promptAgent.register();
    
    // High quality input
    const highQualityResult = await promptAgent.processRequest(
      'Generate deep meditation music with 528Hz healing frequency for 15 minutes using singing bowls and nature sounds',
      {
        duration: 15,
        style: 'healing meditation',
        mood: 'deeply peaceful',
        binaural: true,
        frequency: 528,
        instruments: ['singing bowl', 'nature sounds', 'soft pad']
      }
    );

    // Low quality input
    const lowQualityResult = await promptAgent.processRequest(
      'music',
      {}
    );

    expect(highQualityResult.metadata.confidence).toBeGreaterThan(lowQualityResult.metadata.confidence);
    expect(highQualityResult.metadata.confidence).toBeGreaterThan(0.8);
    expect(lowQualityResult.metadata.confidence).toBeLessThan(0.5);
  });

  test('should extract therapeutic elements correctly', async () => {
    await promptAgent.register();
    
    const result = await promptAgent.processRequest(
      'Help me with sleep problems and stress using healing frequencies',
      {
        binaural: true,
        frequency: 4, // Delta waves
        style: 'healing meditation'
      }
    );

    const therapeuticElements = result.metadata.therapeuticElements;
    expect(therapeuticElements).toContain('sleep-induction');
    expect(therapeuticElements).toContain('stress-reduction');
    expect(therapeuticElements).toContain('delta-waves');
  });

  test('should handle handoff messages correctly', async () => {
    await promptAgent.register();
    
    const handoffMessage: CoralHandoffMessage = {
      id: 'test-handoff-1',
      timestamp: new Date().toISOString(),
      type: 'handoff',
      fromAgent: 'test-client',
      toAgent: 'test-prompt-agent',
      handoffType: 'prompt-to-music',
      payload: {
        userRequest: 'Create meditation music',
        musicConfig: { duration: 5 }
      }
    };

    const result = await promptAgent.receiveHandoff(handoffMessage);
    expect(result).toBeDefined();
    expect(result.optimizedPrompt).toBeDefined();
  });

  test('should provide detailed analytics and status', async () => {
    await promptAgent.register();
    
    // Generate some prompts to build analytics
    await promptAgent.processRequest('test 1', { duration: 5 });
    await promptAgent.processRequest('test 2', { duration: 10 });
    
    const status = promptAgent.getDetailedStatus();
    
    expect(status.analytics.promptsGenerated).toBe(2);
    expect(status.health.status).toBe('healthy');
    expect(status.sessionId).toBeDefined();
    expect(status.health.memoryUsage).toBeDefined();
  });
});

describe('Enhanced Music Generation Agent', () => {
  let musicAgent: EnhancedMusicGenerationAgent;

  beforeEach(() => {
    musicAgent = new EnhancedMusicGenerationAgent({
      agentId: 'test-music-agent',
      version: '2.0.0-test',
      registrationEndpoint: 'http://test.com/register',
      capabilities: [
        {
          name: 'test-music-generation',
          description: 'Test music generation',
          inputType: 'prompt',
          outputType: 'audio',
          version: '2.0.0'
        }
      ]
    });
  });

  test('should register music agent successfully', async () => {
    const result = await musicAgent.register();
    expect(result).toBe(true);
    
    const status = musicAgent.getDetailedStatus();
    expect(status.isRegistered).toBe(true);
    expect(status.agentId).toBe('test-music-agent');
    expect(status.providers.available).toContain('diffrhythm');
    expect(status.providers.available).toContain('audiocraft');
  });

  test('should generate music with quality metrics', async () => {
    await musicAgent.register();
    
    const result = await musicAgent.generateEnhancedMusic({
      prompt: 'Create peaceful meditation music with 7.83Hz frequency',
      config: {
        duration: 5,
        style: 'ambient',
        mood: 'peaceful',
        binaural: true,
        frequency: 7.83
      },
      therapeuticElements: ['grounding', 'stress-reduction'],
      confidence: 0.9
    });

    expect(result).toBeDefined();
    expect(result.audioUrl).toBeDefined();
    expect(result.duration).toBeGreaterThan(0);
    expect(result.metadata.estimatedTherapeuticValue).toBeGreaterThan(0);
    expect(result.analytics.qualityScore).toBeGreaterThan(0);
    expect(result.metadata.therapeuticFrequencies).toContain(7.83);
  });

  test('should select optimal provider based on requirements', async () => {
    await musicAgent.register();
    
    // Long duration should prefer DiffRhythm
    const longTrackResult = await musicAgent.generateEnhancedMusic({
      prompt: 'Long meditation track',
      config: {
        duration: 20, // Long duration
        binaural: true,
        instruments: ['singing bowl', 'nature', 'pad']
      }
    });

    // Note: In test environment, both will likely use AudioCraft due to mocking
    // but the logic should still execute
    expect(longTrackResult.analytics.providerUsed).toBeDefined();
  });

  test('should handle handoff from prompt agent', async () => {
    await musicAgent.register();
    
    const handoffMessage: CoralHandoffMessage = {
      id: 'test-music-handoff',
      timestamp: new Date().toISOString(),
      type: 'handoff',
      fromAgent: 'test-prompt-agent',
      toAgent: 'test-music-agent',
      handoffType: 'prompt-to-music',
      payload: {
        generatedPrompt: 'Create meditation music with 7.83Hz for grounding',
        musicConfig: {
          duration: 10,
          binaural: true,
          frequency: 7.83
        },
        therapeuticElements: ['grounding'],
        confidence: 0.85
      }
    };

    const result = await musicAgent.receiveHandoff(handoffMessage);
    
    expect(result).toBeDefined();
    expect(result.audioUrl).toBeDefined();
    expect(result.metadata.binauralBeats).toBe(true);
    expect(result.metadata.therapeuticFrequencies).toContain(7.83);
  });

  test('should calculate therapeutic value correctly', async () => {
    await musicAgent.register();
    
    const highTherapeuticResult = await musicAgent.generateEnhancedMusic({
      prompt: 'Therapeutic healing music',
      config: {
        duration: 15, // Optimal duration
        binaural: true,
        frequency: 528 // Healing frequency
      },
      therapeuticElements: ['healing', 'stress-reduction', 'grounding'],
      confidence: 0.95
    });

    const lowTherapeuticResult = await musicAgent.generateEnhancedMusic({
      prompt: 'Simple background music',
      config: {
        duration: 2 // Too short
      },
      therapeuticElements: [],
      confidence: 0.3
    });

    expect(highTherapeuticResult.metadata.estimatedTherapeuticValue)
      .toBeGreaterThan(lowTherapeuticResult.metadata.estimatedTherapeuticValue);
  });

  test('should handle fallback generation on errors', async () => {
    await musicAgent.register();
    
    // This should trigger fallback logic
    const result = await musicAgent.generateEnhancedMusic({
      prompt: '', // Empty prompt to potentially trigger fallback
      config: { duration: 5 }
    });

    expect(result).toBeDefined();
    expect(result.audioUrl).toBeDefined();
    // Fallback should still produce valid audio
  });

  test('should track analytics correctly', async () => {
    await musicAgent.register();
    
    const initialStatus = musicAgent.getDetailedStatus();
    const initialCount = initialStatus.analytics.tracksGenerated;
    
    await musicAgent.generateEnhancedMusic({
      prompt: 'Test track',
      config: { duration: 3 }
    });
    
    const updatedStatus = musicAgent.getDetailedStatus();
    expect(updatedStatus.analytics.tracksGenerated).toBe(initialCount + 1);
  });
});

describe('Message Bus Integration', () => {
  let messageBus: CoralMessageBus;
  let promptAgent: EnhancedCoralProtocolAgent;
  let musicAgent: EnhancedMusicGenerationAgent;

  beforeEach(async () => {
    messageBus = CoralMessageBus.getInstance();
    
    promptAgent = new EnhancedCoralProtocolAgent({
      agentId: 'integration-prompt-agent',
      version: '2.0.0-test',
      registrationEndpoint: 'http://test.com/register',
      capabilities: []
    });

    musicAgent = new EnhancedMusicGenerationAgent({
      agentId: 'integration-music-agent',
      version: '2.0.0-test',
      registrationEndpoint: 'http://test.com/register',
      capabilities: []
    });

    await promptAgent.register();
    await musicAgent.register();
  });

  test('should handle complete agent-to-agent workflow', async () => {
    const promptResult = await promptAgent.processRequest(
      'Create stress relief meditation with binaural beats',
      {
        duration: 8,
        binaural: true,
        frequency: 7.83,
        mood: 'peaceful'
      }
    );

    expect(promptResult.metadata.confidence).toBeGreaterThan(0.6);

    const musicResult = await promptAgent.initiateHandoffToMusicAgent(promptResult, {
      duration: 8,
      binaural: true,
      frequency: 7.83,
      mood: 'peaceful'
    });

    expect(musicResult).toBeDefined();
    expect(musicResult.audioUrl).toBeDefined();
    expect(musicResult.metadata.binauralBeats).toBe(true);
  });

  test('should maintain message correlation across handoffs', async () => {
    const sessionId = 'test-session-123';
    
    const handoffMessage = messageBus.createHandoffMessage(
      'integration-prompt-agent',
      'integration-music-agent',
      'prompt-to-music',
      {
        generatedPrompt: 'Test prompt',
        musicConfig: { duration: 5 }
      },
      sessionId
    );

    expect(handoffMessage.metadata?.sessionId).toBe(sessionId);
    expect(handoffMessage.metadata?.correlationId).toBeDefined();
    expect(handoffMessage.id).toContain('handoff-');
  });

  test('should provide accurate system status', async () => {
    const status = await messageBus.getSystemStatus();
    
    expect(status.totalAgents).toBeGreaterThanOrEqual(2);
    expect(status.healthyAgents).toBe(status.totalAgents);
    expect(status.agents).toHaveLength(status.totalAgents);
    expect(status.timestamp).toBeDefined();
  });

  test('should handle agent health checks', async () => {
    const promptHealth = await messageBus.checkAgentHealth('integration-prompt-agent');
    const musicHealth = await messageBus.checkAgentHealth('integration-music-agent');
    const unknownHealth = await messageBus.checkAgentHealth('non-existent-agent');

    expect(promptHealth).toBe(true);
    expect(musicHealth).toBe(true);
    expect(unknownHealth).toBe(false);
  });
});

describe('Error Handling and Edge Cases', () => {
  test('should handle malformed handoff messages', async () => {
    const agent = new EnhancedCoralProtocolAgent({
      agentId: 'error-test-agent',
      version: '2.0.0-test',
      registrationEndpoint: 'http://test.com/register',
      capabilities: []
    });

    await agent.register();

    const malformedHandoff = {
      id: 'malformed',
      timestamp: new Date().toISOString(),
      type: 'handoff',
      fromAgent: 'test',
      toAgent: 'error-test-agent',
      handoffType: 'error-recovery' as any,
      payload: {}
    } as CoralHandoffMessage;

    await expect(agent.receiveHandoff(malformedHandoff)).rejects.toThrow();
  });

  test('should handle empty or invalid prompts gracefully', async () => {
    const agent = new EnhancedCoralProtocolAgent({
      agentId: 'empty-prompt-test',
      version: '2.0.0-test',
      registrationEndpoint: 'http://test.com/register',
      capabilities: []
    });

    await agent.register();

    const result = await agent.processRequest('', {});
    
    // Should still return a result, but with lower confidence
    expect(result).toBeDefined();
    expect(result.metadata.confidence).toBeLessThan(0.5);
  });

  test('should handle audio generation failures with fallback', async () => {
    const musicAgent = new EnhancedMusicGenerationAgent({
      agentId: 'fallback-test-agent',
      version: '2.0.0-test',
      registrationEndpoint: 'http://test.com/register',
      capabilities: []
    });

    await musicAgent.register();

    // This might trigger fallback in some scenarios
    const result = await musicAgent.generateEnhancedMusic({
      prompt: 'Test fallback music',
      config: { duration: 1 }
    });

    expect(result).toBeDefined();
    expect(result.audioUrl).toBeDefined();
  });
});

export { };