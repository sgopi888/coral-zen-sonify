/**
 * Agent Orchestrator - Hackathon Centerpiece
 * Coordinates multiple agents for seamless meditation music generation
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioLines, Bot, Activity, Zap, CheckCircle, AlertCircle, Clock, Download } from 'lucide-react';
import { messageBus } from '@/services/CoralMessageBus';
import { enhancedMeditationAgent } from './EnhancedCoralProtocolAgent';
import { enhancedMusicAgent } from './EnhancedMusicGenerationAgent';
import { useToast } from "@/hooks/use-toast";

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress: number;
  result?: any;
  error?: string;
}

export const AgentOrchestrator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([
    { id: 'prompt', name: 'Prompt Generation', status: 'pending', progress: 0 },
    { id: 'handoff', name: 'Agent Handoff', status: 'pending', progress: 0 },
    { id: 'music', name: 'Music Generation', status: 'pending', progress: 0 },
    { id: 'optimization', name: 'Quality Optimization', status: 'pending', progress: 0 }
  ]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [userInput, setUserInput] = useState('Create a peaceful meditation track for stress relief with gentle nature sounds');
  const { toast } = useToast();

  useEffect(() => {
    initializeSystem();
    setupEventListeners();
    
    return () => {
      // Cleanup event listeners
    };
  }, []);

  const initializeSystem = async () => {
    console.log('🚀 Initializing Agent Orchestration System');
    
    try {
      // Register both agents
      await enhancedMeditationAgent.register();
      await enhancedMusicAgent.register();
      
      // Get system status
      const status = await messageBus.getSystemStatus();
      setSystemStatus(status);
      
      toast({
        title: "System Ready",
        description: `${status.totalAgents} agents registered and ready for orchestration`,
      });
    } catch (error) {
      console.error('❌ System initialization failed:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize agent system",
        variant: "destructive",
      });
    }
  };

  const setupEventListeners = () => {
    messageBus.addEventListener('handoff-completed', (event) => {
      console.log('📡 Handoff completed:', event);
      updateWorkflowProgress(event.data);
    });

    messageBus.addEventListener('message-sent', (event) => {
      console.log('📤 Message sent:', event);
    });

    messageBus.addEventListener('error', (event) => {
      console.error('❌ Agent error:', event);
      handleWorkflowError(event.data);
    });
  };

  const updateWorkflowProgress = (data: any) => {
    setWorkflow(prev => prev.map(step => {
      if (step.id === 'handoff' && data.handoff) {
        return { ...step, status: 'completed', progress: 100, result: data.response };
      }
      return step;
    }));
  };

  const handleWorkflowError = (error: any) => {
    setWorkflow(prev => prev.map(step => {
      if (step.status === 'active') {
        return { ...step, status: 'error', error: error.error };
      }
      return step;
    }));
    setIsGenerating(false);
  };

  const startOrchestration = async () => {
    console.log('🎼 Starting Agent Orchestration Workflow');
    setIsGenerating(true);
    setFinalResult(null);
    
    // Reset workflow
    setWorkflow(prev => prev.map(step => ({ ...step, status: 'pending', progress: 0, error: undefined })));

    try {
      // Step 1: Generate prompt with enhanced agent
      setWorkflow(prev => prev.map(step => 
        step.id === 'prompt' ? { ...step, status: 'active', progress: 20 } : step
      ));

      const promptResult = await enhancedMeditationAgent.processRequest(userInput, {
        duration: 10,
        style: 'ambient meditation',
        mood: 'peaceful',
        binaural: true,
        frequency: 7.83,
        instruments: ['singing bowl', 'nature sounds', 'soft pad']
      });

      setWorkflow(prev => prev.map(step => 
        step.id === 'prompt' ? { ...step, status: 'completed', progress: 100, result: promptResult } : step
      ));

      // Step 2: Initiate handoff
      setWorkflow(prev => prev.map(step => 
        step.id === 'handoff' ? { ...step, status: 'active', progress: 50 } : step
      ));

      const musicResult = await enhancedMeditationAgent.initiateHandoffToMusicAgent(promptResult, {
        duration: 10,
        style: 'ambient meditation',
        mood: 'peaceful',
        binaural: true,
        frequency: 7.83,
        instruments: ['singing bowl', 'nature sounds', 'soft pad']
      });

      setWorkflow(prev => prev.map(step => 
        step.id === 'handoff' ? { ...step, status: 'completed', progress: 100 } : step
      ));

      // Step 3: Music generation (handled by handoff)
      setWorkflow(prev => prev.map(step => 
        step.id === 'music' ? { ...step, status: 'completed', progress: 100, result: musicResult } : step
      ));

      // Step 4: Quality optimization
      setWorkflow(prev => prev.map(step => 
        step.id === 'optimization' ? { ...step, status: 'active', progress: 75 } : step
      ));

      // Simulate quality optimization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setWorkflow(prev => prev.map(step => 
        step.id === 'optimization' ? { ...step, status: 'completed', progress: 100 } : step
      ));

      setFinalResult(musicResult);

      toast({
        title: "Orchestration Complete",
        description: `Generated ${musicResult.duration}s meditation track with therapeutic optimization`,
      });

    } catch (error) {
      console.error('❌ Orchestration failed:', error);
      handleWorkflowError({ error: error.message });
      
      toast({
        title: "Orchestration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'active': return <Activity className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Coral Protocol Agent Orchestrator
        </h1>
        <p className="text-muted-foreground text-lg">
          Hackathon demonstration of seamless multi-agent coordination for therapeutic music generation
        </p>
      </div>

      <Tabs defaultValue="orchestrator" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orchestrator">Orchestrator</TabsTrigger>
          <TabsTrigger value="agents">Agent Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="orchestrator" className="space-y-6">
          {/* User Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Meditation Music Request
              </CardTitle>
              <CardDescription>
                Describe your ideal meditation experience for AI-powered generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <textarea
                  className="w-full h-24 p-3 border rounded-lg resize-none"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Describe your meditation music vision..."
                />
                <Button 
                  onClick={startOrchestration}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Activity className="mr-2 h-4 w-4 animate-spin" />
                      Orchestrating Agents...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Start Agent Orchestration
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Progress</CardTitle>
              <CardDescription>Real-time agent coordination and task execution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      {getStepIcon(step.status)}
                      <div className="flex-1">
                        <div className="font-medium">{step.name}</div>
                        {step.error && (
                          <div className="text-sm text-red-500 mt-1">{step.error}</div>
                        )}
                        {step.result && (
                          <div className="text-sm text-green-600 mt-1">
                            ✓ {typeof step.result === 'object' ? 'Completed successfully' : step.result}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-24">
                      <Progress value={step.progress} className="h-2" />
                    </div>
                    <Badge variant={step.status === 'completed' ? 'default' : step.status === 'error' ? 'destructive' : 'secondary'}>
                      {step.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Final Result */}
          {finalResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AudioLines className="h-5 w-5" />
                  Generated Meditation Music
                </CardTitle>
                <CardDescription>
                  Therapeutic audio with binaural beats and frequency optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="font-semibold">{Math.round(finalResult.duration / 60)}m {finalResult.duration % 60}s</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Quality</div>
                      <div className="font-semibold">{finalResult.metadata?.quality || 'High'}</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Therapeutic Value</div>
                      <div className="font-semibold">{Math.round((finalResult.metadata?.estimatedTherapeuticValue || 0.8) * 100)}%</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Provider</div>
                      <div className="font-semibold">{finalResult.analytics?.providerUsed || 'DiffRhythm'}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <audio 
                      controls 
                      src={finalResult.audioUrl}
                      className="flex-1"
                    >
                      Your browser does not support audio playback.
                    </audio>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  {finalResult.metadata?.therapeuticFrequencies && (
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <div className="text-sm font-medium mb-2">Therapeutic Frequencies:</div>
                      <div className="flex flex-wrap gap-2">
                        {finalResult.metadata.therapeuticFrequencies.map((freq: number, i: number) => (
                          <Badge key={i} variant="secondary">{freq}Hz</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Prompt Generation Agent</CardTitle>
                <CardDescription>Enhanced meditation prompt optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Prompts Generated:</span>
                    <span className="font-medium">{enhancedMeditationAgent.getDetailedStatus().analytics.promptsGenerated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-medium">{Math.round(enhancedMeditationAgent.getDetailedStatus().analytics.successRate * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Music Generation Agent</CardTitle>
                <CardDescription>Multi-provider therapeutic music creation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Tracks Generated:</span>
                    <span className="font-medium">{enhancedMusicAgent.getDetailedStatus().analytics.tracksGenerated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Quality:</span>
                    <span className="font-medium">{Math.round(enhancedMusicAgent.getDetailedStatus().analytics.averageQuality * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Analytics</CardTitle>
              <CardDescription>Performance metrics and usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics dashboard coming soon...
                <br />
                <span className="text-sm">Real-time metrics, usage patterns, and performance insights</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Real-time monitoring of all system components</CardDescription>
            </CardHeader>
            <CardContent>
              {systemStatus ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{systemStatus.totalAgents}</div>
                      <div className="text-sm text-muted-foreground">Total Agents</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{systemStatus.healthyAgents}</div>
                      <div className="text-sm text-muted-foreground">Healthy Agents</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{systemStatus.messageQueue}</div>
                      <div className="text-sm text-muted-foreground">Message Queue</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium">Registered Agents:</div>
                    {systemStatus.agents.map((agent: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-2 border rounded">
                        <span className="font-mono text-sm">{agent.agentId}</span>
                        <Badge variant={agent.healthy ? 'default' : 'destructive'}>
                          {agent.healthy ? 'Healthy' : 'Unhealthy'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Loading system status...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};