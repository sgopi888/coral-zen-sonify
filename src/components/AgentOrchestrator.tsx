/**
 * Music Generation Interface
 * Simple interface for generating music with multiple providers
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Play, Download, Music, Clock, Zap, Info } from "lucide-react";
import { ElevenLabsProvider } from "@/providers/ElevenLabsProvider";
import { AudioCraftProvider } from "@/providers/AudioCraftProvider";
import { DiffRhythmProvider } from "@/providers/DiffRhythmProvider";
import { MusicGenerationService } from "@/services/MusicGenerationService";
import { useToast } from "@/hooks/use-toast";

export const AgentOrchestrator = () => {
  const [userRequest, setUserRequest] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [generatedMusic, setGeneratedMusic] = useState<any>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("elevenlabs");
  const [duration, setDuration] = useState([30]);
  const [musicService] = useState(() => {
    const service = new MusicGenerationService();
    service.addProvider('elevenlabs', new ElevenLabsProvider());
    service.addProvider('audiocraft', new AudioCraftProvider());
    service.addProvider('diffrhythm', new DiffRhythmProvider());
    return service;
  });
  const { toast } = useToast();

  useEffect(() => {
    // Set preferred provider
    musicService.setPreferredProvider(selectedProvider);
  }, [selectedProvider, musicService]);

  const generatePrompt = async () => {
    if (!userRequest.trim()) return;
    
    setIsGeneratingPrompt(true);
    try {
      // Simple prompt generation for demo
      let prompt = userRequest;
      
      // Add some enhancements based on common music generation patterns
      if (userRequest.toLowerCase().includes('meditation')) {
        prompt += '. Create a peaceful, meditative composition with gentle melodies and soothing harmonies';
      }
      if (userRequest.toLowerCase().includes('upbeat')) {
        prompt += '. Make it energetic and uplifting with a strong rhythm';
      }
      if (userRequest.toLowerCase().includes('classical')) {
        prompt += '. Use classical music elements with rich orchestration';
      }
      
      prompt += `. Duration: ${duration[0]} seconds. High quality audio production.`;
      
      setGeneratedPrompt(prompt);
      toast({
        title: "Prompt Generated",
        description: "Music prompt has been created successfully",
      });
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: "Error",
        description: "Failed to generate prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const generateMusic = async () => {
    if (!generatedPrompt.trim()) return;
    
    setIsGeneratingMusic(true);
    try {
      const response = await musicService.generateMusic(generatedPrompt, {
        duration: duration[0],
        style: userRequest.toLowerCase().includes('classical') ? 'classical' : 
               userRequest.toLowerCase().includes('meditation') ? 'meditation' : 'ambient',
        mood: userRequest.toLowerCase().includes('upbeat') ? 'energetic' : 'peaceful',
        tempo: userRequest.toLowerCase().includes('fast') ? 130 : 90,
        instruments: userRequest.toLowerCase().includes('piano') ? ['piano'] : 
                    userRequest.toLowerCase().includes('guitar') ? ['guitar'] : ['piano', 'strings'],
        includeVocals: userRequest.toLowerCase().includes('vocal') || userRequest.toLowerCase().includes('singing')
      });
      
      setGeneratedMusic(response);
      toast({
        title: "Music Generated",
        description: `Created ${response.duration}s track using ${selectedProvider}`,
      });
    } catch (error) {
      console.error('Error generating music:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate music. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const downloadMusic = () => {
    if (generatedMusic?.audioUrl) {
      const a = document.createElement('a');
      a.href = generatedMusic.audioUrl;
      a.download = `meditation-music-${Date.now()}.${generatedMusic.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const providerInfo = {
    elevenlabs: { name: "ElevenLabs Music", maxDuration: 300, quality: "Professional" },
    audiocraft: { name: "AudioCraft", maxDuration: 600, quality: "Demo" },
    diffrhythm: { name: "DiffRhythm", maxDuration: 285, quality: "High" }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          AI Music Generator
        </h1>
        <p className="text-muted-foreground text-lg">
          Create beautiful meditation and ambient music using AI
        </p>
      </div>

      {/* User Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Music Request
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="w-full h-24 p-3 border rounded-lg resize-none"
            value={userRequest}
            onChange={(e) => setUserRequest(e.target.value)}
            placeholder="Describe the music you want to create... (e.g., 'peaceful piano meditation music for stress relief')"
          />
          
          {/* Provider Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Music Provider</label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select music provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elevenlabs">🎵 ElevenLabs Music (Professional)</SelectItem>
                  <SelectItem value="audiocraft">🎼 AudioCraft (Demo)</SelectItem>
                  <SelectItem value="diffrhythm">🎶 DiffRhythm (High Quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration: {duration[0]} seconds</label>
              <Slider
                value={duration}
                onValueChange={setDuration}
                max={providerInfo[selectedProvider as keyof typeof providerInfo]?.maxDuration || 300}
                min={10}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          {/* Provider Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4" />
              <span className="font-medium">Provider Info</span>
            </div>
            <div className="text-sm space-y-1">
              <div>Provider: {providerInfo[selectedProvider as keyof typeof providerInfo]?.name}</div>
              <div>Max Duration: {providerInfo[selectedProvider as keyof typeof providerInfo]?.maxDuration}s</div>
              <div>Quality: {providerInfo[selectedProvider as keyof typeof providerInfo]?.quality}</div>
            </div>
          </div>

          <Button 
            onClick={generatePrompt}
            disabled={isGeneratingPrompt || !userRequest.trim()}
            className="w-full"
          >
            {isGeneratingPrompt ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Generating Prompt...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Generate Music Prompt
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Prompt */}
      {generatedPrompt && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-muted rounded-lg mb-4">
              <p className="text-sm">{generatedPrompt}</p>
            </div>
            <Button 
              onClick={generateMusic}
              disabled={isGeneratingMusic}
              className="w-full"
              size="lg"
            >
              {isGeneratingMusic ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Generating Music with {selectedProvider}...
                </>
              ) : (
                <>
                  <Music className="mr-2 h-4 w-4" />
                  Generate Music
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Music */}
      {generatedMusic && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Generated Music
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{generatedMusic.format.toUpperCase()}</Badge>
              <Badge variant="outline">{generatedMusic.duration}s</Badge>
              <Badge variant="outline">{generatedMusic.metadata.model}</Badge>
            </div>
            
            <audio 
              controls 
              src={generatedMusic.audioUrl}
              className="w-full"
            >
              Your browser does not support the audio element.
            </audio>
            
            <div className="flex gap-2">
              <Button onClick={downloadMusic} variant="outline" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
            
            {generatedMusic.metadata && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Generation Details</div>
                <div className="text-xs space-y-1">
                  <div>Model: {generatedMusic.metadata.model}</div>
                  <div>Generated: {new Date(generatedMusic.metadata.generatedAt).toLocaleString()}</div>
                  {generatedMusic.analytics && (
                    <>
                      <div>Provider: {generatedMusic.analytics.providerUsed}</div>
                      <div>Generation Time: {(generatedMusic.analytics.generationTime / 1000).toFixed(1)}s</div>
                      <div>Quality Score: {(generatedMusic.analytics.qualityScore * 100).toFixed(0)}%</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};