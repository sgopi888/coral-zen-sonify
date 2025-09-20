/**
 * Coral Protocol Message Bus
 * Handles agent-to-agent communication and message routing
 */

import { MCPMessage, CoralHandoffMessage, MessageBusEvent, CoralProtocolError } from '@/types/CoralProtocol';

export class CoralMessageBus {
  private static instance: CoralMessageBus;
  private agents: Map<string, any> = new Map();
  private messageQueue: MCPMessage[] = [];
  private eventListeners: Map<string, ((event: MessageBusEvent) => void)[]> = new Map();
  private isProcessing = false;

  static getInstance(): CoralMessageBus {
    if (!CoralMessageBus.instance) {
      CoralMessageBus.instance = new CoralMessageBus();
    }
    return CoralMessageBus.instance;
  }

  registerAgent(agentId: string, agent: any): void {
    console.log(`📡 Registering agent: ${agentId}`);
    this.agents.set(agentId, agent);
    this.emitEvent({
      type: 'agent-registered',
      agentId,
      timestamp: new Date().toISOString(),
      data: { capabilities: agent.getCapabilities?.() }
    });
  }

  unregisterAgent(agentId: string): void {
    console.log(`📡 Unregistering agent: ${agentId}`);
    this.agents.delete(agentId);
    this.emitEvent({
      type: 'agent-unregistered',
      agentId,
      timestamp: new Date().toISOString(),
      data: {}
    });
  }

  async sendMessage(message: MCPMessage): Promise<any> {
    console.log(`📨 Sending message from ${message.fromAgent} to ${message.toAgent}`, message);
    
    const targetAgent = this.agents.get(message.toAgent);
    if (!targetAgent) {
      throw new CoralProtocolError(
        `Target agent ${message.toAgent} not found`,
        'AGENT_NOT_FOUND',
        message.fromAgent,
        message.id
      );
    }

    this.emitEvent({
      type: 'message-sent',
      agentId: message.fromAgent,
      timestamp: new Date().toISOString(),
      data: { message }
    });

    try {
      let response;
      
      if (message.type === 'handoff') {
        response = await targetAgent.receiveHandoff?.(message as CoralHandoffMessage);
      } else if (message.type === 'request') {
        response = await targetAgent.processRequest?.(message.payload, message.metadata);
      } else {
        response = await targetAgent.handleMessage?.(message);
      }

      this.emitEvent({
        type: 'message-received',
        agentId: message.toAgent,
        timestamp: new Date().toISOString(),
        data: { message, response }
      });

      return response;
    } catch (error) {
      console.error(`❌ Message processing failed:`, error);
      this.emitEvent({
        type: 'error',
        agentId: message.toAgent,
        timestamp: new Date().toISOString(),
        data: { message, error: error.message }
      });
      throw error;
    }
  }

  async sendHandoff(handoff: CoralHandoffMessage): Promise<any> {
    console.log(`🔄 Processing handoff: ${handoff.handoffType}`, handoff);
    
    const response = await this.sendMessage(handoff);
    
    this.emitEvent({
      type: 'handoff-completed',
      agentId: handoff.fromAgent,
      timestamp: new Date().toISOString(),
      data: { handoff, response }
    });

    return response;
  }

  createHandoffMessage(
    fromAgent: string,
    toAgent: string,
    handoffType: CoralHandoffMessage['handoffType'],
    payload: any,
    sessionId?: string
  ): CoralHandoffMessage {
    return {
      id: `handoff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: 'handoff',
      fromAgent,
      toAgent,
      handoffType,
      payload,
      metadata: {
        priority: 'normal',
        sessionId: sessionId || `session-${Date.now()}`,
        correlationId: `corr-${Date.now()}`,
        retryCount: 0,
        timeout: 30000
      }
    };
  }

  getRegisteredAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  isAgentRegistered(agentId: string): boolean {
    return this.agents.has(agentId);
  }

  addEventListener(eventType: string, callback: (event: MessageBusEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  removeEventListener(eventType: string, callback: (event: MessageBusEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(event: MessageBusEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    });
  }

  // Health monitoring
  async checkAgentHealth(agentId: string): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    
    try {
      return await agent.checkHealth?.() || true;
    } catch (error) {
      console.error(`Health check failed for ${agentId}:`, error);
      return false;
    }
  }

  async getSystemStatus() {
    const agents = Array.from(this.agents.keys());
    const healthChecks = await Promise.allSettled(
      agents.map(async agentId => ({
        agentId,
        healthy: await this.checkAgentHealth(agentId)
      }))
    );

    return {
      totalAgents: agents.length,
      healthyAgents: healthChecks.filter(result => 
        result.status === 'fulfilled' && result.value.healthy
      ).length,
      agents: healthChecks.map(result => 
        result.status === 'fulfilled' ? result.value : { agentId: 'unknown', healthy: false }
      ),
      messageQueue: this.messageQueue.length,
      timestamp: new Date().toISOString()
    };
  }
}

export const messageBus = CoralMessageBus.getInstance();