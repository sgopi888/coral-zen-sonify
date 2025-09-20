import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Code, ExternalLink, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ApiDocumentation = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(label);
      setTimeout(() => setCopiedCode(null), 2000);
      toast({
        title: "Copied to clipboard",
        description: `${label} copied successfully`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const curlExample = `curl -X POST "https://thzhvpxpkajthfkzfxbr.supabase.co/functions/v1/agents/music-generator" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key-here" \\
  -d '{
    "prompt": "Create a peaceful piano meditation track",
    "duration": 60,
    "style": "ambient",
    "mood": "peaceful",
    "tempo": 70,
    "key": "C minor",
    "instruments": ["piano", "strings"]
  }'`;

  const javascriptExample = `// Using fetch API
const generateMusic = async () => {
  const response = await fetch(
    'https://thzhvpxpkajthfkzfxbr.supabase.co/functions/v1/agents/music-generator',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-api-key-here'
      },
      body: JSON.stringify({
        prompt: 'Create a peaceful piano meditation track',
        duration: 60,
        style: 'ambient',
        mood: 'peaceful',
        tempo: 70,
        key: 'C minor',
        instruments: ['piano', 'strings']
      })
    }
  );
  
  const result = await response.json();
  console.log('Generated music:', result);
  
  // result.url contains the MP3 file URL
  if (result.status === 'success') {
    const audio = new Audio(result.url);
    audio.play();
  }
};`;

  const pythonExample = `import requests
import json

def generate_music():
    url = "https://thzhvpxpkajthfkzfxbr.supabase.co/functions/v1/agents/music-generator"
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": "your-api-key-here"
    }
    
    payload = {
        "prompt": "Create a peaceful piano meditation track",
        "duration": 60,
        "style": "ambient",
        "mood": "peaceful",
        "tempo": 70,
        "key": "C minor",
        "instruments": ["piano", "strings"]
    }
    
    response = requests.post(url, headers=headers, json=payload)
    result = response.json()
    
    if result.get("status") == "success":
        print(f"Music generated: {result['url']}")
        return result["url"]
    else:
        print(f"Error: {result.get('error')}")
        return None`;

  const nodeExample = `const axios = require('axios');

const generateMusic = async () => {
  try {
    const response = await axios.post(
      'https://thzhvpxpkajthfkzfxbr.supabase.co/functions/v1/agents/music-generator',
      {
        prompt: 'Create a peaceful piano meditation track',
        duration: 60,
        style: 'ambient',
        mood: 'peaceful',
        tempo: 70,
        key: 'C minor',
        instruments: ['piano', 'strings']
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'your-api-key-here'
        }
      }
    );
    
    if (response.data.status === 'success') {
      console.log('Music generated:', response.data.url);
      return response.data.url;
    }
  } catch (error) {
    console.error('Generation failed:', error.response?.data || error.message);
  }
};`;

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => copyToClipboard(text, label)}
      className="absolute top-3 right-3 h-8 w-8 p-0"
    >
      {copiedCode === label ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-studio bg-clip-text text-transparent mb-4">
          API Documentation
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Integrate ElevenLabs Music Generation into your applications
        </p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            API Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Base URL</h4>
              <code className="text-sm bg-muted px-3 py-1 rounded">
                https://thzhvpxpkajthfkzfxbr.supabase.co/functions/v1
              </code>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Authentication</h4>
              <Badge variant="secondary">X-API-Key Header Required</Badge>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">Endpoints</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Badge variant="default">POST</Badge>
                <code className="text-sm">/agents/music-generator</code>
                <span className="text-sm text-muted-foreground">Generate music from text prompt</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Badge variant="outline">GET</Badge>
                <code className="text-sm">/agents</code>
                <span className="text-sm text-muted-foreground">List available agents</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Badge variant="outline">GET</Badge>
                <code className="text-sm">/agents/music-generator/metadata</code>
                <span className="text-sm text-muted-foreground">Get agent metadata</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request/Response Schema */}
      <Card>
        <CardHeader>
          <CardTitle>Request & Response Schema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Request Body</h4>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "prompt": "string (required)",
  "duration": "number (10-300, default: 60)",
  "style": "string (optional)",
  "mood": "string (optional)", 
  "tempo": "number (40-180, optional)",
  "key": "string (optional)",
  "instruments": "array of strings (optional)"
}`}
              </pre>
              <CopyButton 
                text={`{
  "prompt": "string (required)",
  "duration": "number (10-300, default: 60)", 
  "style": "string (optional)",
  "mood": "string (optional)",
  "tempo": "number (40-180, optional)",
  "key": "string (optional)",
  "instruments": "array of strings (optional)"
}`}
                label="Request Schema"
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Success Response</h4>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "status": "success",
  "url": "https://storage-url/music.mp3",
  "duration": 60,
  "format": "mp3",
  "metadata": {
    "generation_time": "2024-01-01T12:00:00Z",
    "provider": "ElevenLabs"
  }
}`}
              </pre>
              <CopyButton 
                text={`{
  "status": "success",
  "url": "https://storage-url/music.mp3",
  "duration": 60,
  "format": "mp3",
  "metadata": {
    "generation_time": "2024-01-01T12:00:00Z",
    "provider": "ElevenLabs"
  }
}`}
                label="Response Schema"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* cURL Example */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">cURL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                {curlExample}
              </pre>
              <CopyButton text={curlExample} label="cURL" />
            </div>
          </CardContent>
        </Card>

        {/* JavaScript Example */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">JavaScript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                {javascriptExample}
              </pre>
              <CopyButton text={javascriptExample} label="JavaScript" />
            </div>
          </CardContent>
        </Card>

        {/* Python Example */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Python</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                {pythonExample}
              </pre>
              <CopyButton text={pythonExample} label="Python" />
            </div>
          </CardContent>
        </Card>

        {/* Node.js Example */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Node.js</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                {nodeExample}
              </pre>
              <CopyButton text={nodeExample} label="Node.js" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Handling */}
      <Card>
        <CardHeader>
          <CardTitle>Error Handling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="destructive">401</Badge>
                <span className="font-medium">Unauthorized</span>
              </div>
              <p className="text-sm text-gray-600">Invalid or missing API key</p>
            </div>
            
            <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">400</Badge>
                <span className="font-medium">Bad Request</span>
              </div>
              <p className="text-sm text-gray-600">Missing required fields or invalid parameters</p>
            </div>
            
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="destructive">500</Badge>
                <span className="font-medium">Server Error</span>
              </div>
              <p className="text-sm text-gray-600">Internal server error or music generation failed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test Your Agent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-semibold mb-2">Step 1: Generate API Key</h4>
              <p className="text-sm text-gray-700">Go to the Agent Dashboard above and generate an API key for the Music Generator agent.</p>
            </div>
            
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <h4 className="font-semibold mb-2">Step 2: Test with cURL</h4>
              <p className="text-sm text-gray-700">Copy the cURL example above, replace "your-api-key-here" with your actual API key, and run it in your terminal.</p>
            </div>
            
            <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
              <h4 className="font-semibold mb-2">Step 3: Integrate into Your App</h4>
              <p className="text-sm text-gray-700">Use the JavaScript, Python, or Node.js examples to integrate music generation into your application.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limits & Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Generation Limits</h4>
              <ul className="text-sm space-y-1">
                <li>• Maximum duration: 300 seconds</li>
                <li>• Minimum duration: 10 seconds</li>
                <li>• Timeout: 5 minutes per request</li>
              </ul>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Best Practices</h4>
              <ul className="text-sm space-y-1">  
                <li>• Use detailed prompts for better results</li>
                <li>• Implement proper error handling</li>
                <li>• Cache generated music URLs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};