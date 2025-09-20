import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Eye, Key, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  endpoint: string;
  version: string;
  status: string;
  metadata: any;
  created_at: string;
}

interface ApiKey {
  id: string;
  agent_id: string;
  api_key: string;
  name: string;
  is_active: boolean;
  last_used: string | null;
  created_at: string;
}

export default function AgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAgents();
    fetchApiKeys();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch agents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim() || !selectedAgent) {
      toast({
        title: "Error",
        description: "Please provide a key name and select an agent",
        variant: "destructive"
      });
      return;
    }

    try {
      const apiKey = `ak_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const { error } = await supabase
        .from('agent_api_keys')
        .insert({
          agent_id: selectedAgent,
          api_key: apiKey,
          name: newKeyName.trim()
        });

      if (error) throw error;
      
      setNewKeyName('');
      setSelectedAgent('');
      fetchApiKeys();
      
      toast({
        title: "Success",
        description: "API key generated successfully",
      });
    } catch (error) {
      console.error('Error generating API key:', error);
      toast({
        title: "Error",
        description: "Failed to generate API key",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const getCapabilityBadgeColor = (capability: string) => {
    const colors: Record<string, string> = {
      'text-to-music': 'bg-blue-100 text-blue-800',
      'audio-generation': 'bg-green-100 text-green-800',
      'image-generation': 'bg-purple-100 text-purple-800',
      'text-processing': 'bg-orange-100 text-orange-800'
    };
    return colors[capability] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground">Manage your AI agents and API keys</p>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <CardDescription className="mt-1">{agent.description}</CardDescription>
                </div>
                <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                  {agent.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Capabilities</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {agent.capabilities.map((capability, index) => (
                      <Badge key={index} variant="outline" className={getCapabilityBadgeColor(capability)}>
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Endpoint</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                      {agent.endpoint}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(agent.endpoint)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-muted-foreground">v{agent.version}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{agent.name}</DialogTitle>
                        <DialogDescription>{agent.description}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="font-medium">Metadata</Label>
                          <Textarea 
                            value={JSON.stringify(agent.metadata, null, 2)} 
                            readOnly 
                            className="mt-1 font-mono text-xs"
                            rows={10}
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Keys Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Generate and manage API keys for external access to your agents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Generate New Key */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium">Generate New API Key</h4>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., Production App"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="agent">Agent</Label>
                <select 
                  id="agent"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                >
                  <option value="">Select an agent</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={generateApiKey} className="w-full">
                  Generate Key
                </Button>
              </div>
            </div>
          </div>

          {/* Existing Keys */}
          <div className="space-y-2">
            {apiKeys.map((key) => {
              const agent = agents.find(a => a.id === key.agent_id);
              return (
                <div key={key.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{key.name}</span>
                      <Badge variant="outline">{agent?.name}</Badge>
                      {key.is_active ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <code className="text-xs text-muted-foreground">
                      {key.api_key.substring(0, 12)}...{key.api_key.substring(key.api_key.length - 4)}
                    </code>
                    {key.last_used && (
                      <p className="text-xs text-muted-foreground">
                        Last used: {new Date(key.last_used).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(key.api_key)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
            {apiKeys.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No API keys generated yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Usage Example
          </CardTitle>
          <CardDescription>
            Example of how to call your agents from external applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            readOnly
            className="font-mono text-xs"
            rows={12}
            value={`// JavaScript/Node.js Example
const response = await fetch('${window.location.origin}/functions/v1/agents/music-generator', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key-here'
  },
  body: JSON.stringify({
    prompt: "soothing raga meditation",
    duration: 120,
    style: "ambient",
    mood: "peaceful"
  })
});

const result = await response.json();
console.log('Generated music URL:', result.url);

// Response format:
// {
//   "status": "success",
//   "url": "https://storage-url/music-123.mp3",
//   "duration": 120,
//   "format": "mp3"
// }`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
