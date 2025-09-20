/**
 * Coral Protocol Types and Interfaces
 * Standard protocol definitions for agent communication
 */

export interface MCPMessage {
  id: string;
  timestamp: string;
  type: 'request' | 'response' | 'handoff' | 'error' | 'status';
  fromAgent: string;
  toAgent: string;
  payload: any;
  metadata?: {
    priority: 'low' | 'normal' | 'high' | 'urgent';
    sessionId?: string;
    correlationId?: string;
    retryCount?: number;
    timeout?: number;
  };
}

export interface CoralHandoffMessage extends MCPMessage {
  type: 'handoff';
  handoffType: 'prompt-to-music' | 'music-to-export' | 'error-recovery' | 'status-update';
  payload: {
    userRequest?: string;
    generatedPrompt?: string;
    musicConfig?: any;
    audioUrl?: string;
    error?: string;
    status?: string;
    therapeuticElements?: string[];
    confidence?: number;
  };
}

export interface AgentCapability {
  name: string;
  description: string;
  inputType: string;
  outputType: string;
  version: string;
  maxDuration?: number;
  supportsStreaming?: boolean;
}

export interface AgentRegistration {
  agentId: string;
  name: string;
  version: string;
  capabilities: AgentCapability[];
  endpoints: {
    health: string;
    process: string;
    handoff: string;
  };
  metadata: {
    category: string;
    tags: string[];
    description: string;
    author: string;
    registeredAt: string;
  };
}

export interface AgentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: string;
  responseTime: number;
  capabilities: {
    [key: string]: {
      available: boolean;
      performance: number;
      errorRate: number;
    };
  };
}

export interface CoralProtocolConfig {
  agentId: string;
  version: string;
  registrationEndpoint: string;
  capabilities: AgentCapability[];
  healthCheckInterval?: number;
  maxRetries?: number;
  timeout?: number;
}

export interface MessageBusEvent {
  type: 'agent-registered' | 'agent-unregistered' | 'message-sent' | 'message-received' | 'handoff-completed' | 'error';
  agentId: string;
  timestamp: string;
  data: any;
}

export class CoralProtocolError extends Error {
  constructor(
    message: string,
    public code: string,
    public agentId: string,
    public correlationId?: string
  ) {
    super(message);
    this.name = 'CoralProtocolError';
  }
}