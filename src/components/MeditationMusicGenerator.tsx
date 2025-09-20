import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Music, Clock, Volume2, CheckCircle, AlertCircle, Download, Play } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { meditationMusicAgent } from './CoralProtocolAgent';
import { musicGenerationAgent, MusicGenerationResponse } from './MusicGenerationAgent';

interface MusicPromptConfig {
  duration: number;
  tempo: number;
  key: string;
  mood: string;
  instruments: string[];
  atmosphere: string;
}

const MEDITATION_KEYS = [
  'C major', 'G major', 'D major', 'A major', 'F major', 'Bb major', 'Eb major'
];

const MEDITATION_MOODS = [
  'Deeply relaxing', 'Peaceful sleep', 'Mindful awareness', 'Stress relief',
  'Chakra healing', 'Nature connection', 'Emotional balance', 'Focus enhancement'
];

const MEDITATION_INSTRUMENTS = [
  'Tibetan singing bowls', 'Crystal bowls', 'Flutes', 'Soft piano',
  'Ambient pads', 'Rain sounds', 'Ocean waves', 'Forest sounds',
  'Wind chimes', 'Didgeridoo', 'Hang drum', 'Harp'
];

export const MeditationMusicGenerator = () => {
  const [userRequest, setUserRequest] = useState('');
  const [config, setConfig] = useState<MusicPromptConfig>({
    duration: 15,
    tempo: 70,
    key: 'C major',
    mood: 'Deeply relaxing',
    instruments: [],
    atmosphere: 'Serene temple space'
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAgentRegistered, setIsAgentRegistered] = useState(false);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [isMusicAgentRegistered, setIsMusicAgentRegistered] = useState(false);
  const [generatedMusic, setGeneratedMusic] = useState<MusicGenerationResponse | null>(null);
  const { toast } = useToast();

  // Initialize Coral Protocol agents on component mount
  useEffect(() => {
    const initializeAgents = async () => {
      try {
        // Initialize prompt generation agent
        const promptRegistered = await meditationMusicAgent.register();
        setIsAgentRegistered(promptRegistered);
        
        // Initialize music generation agent
        const musicRegistered = await musicGenerationAgent.register();
        setIsMusicAgentRegistered(musicRegistered);
        
        if (promptRegistered && musicRegistered) {
          toast({
            title: "🌊 Coral Protocol Connected",
            description: "Both Prompt & Music Generation agents ready",
          });
        } else if (promptRegistered || musicRegistered) {
          toast({
            title: "⚠️ Partial Coral Protocol Connection", 
            description: "Some agents running in standalone mode",
          });
        } else {
          toast({
            title: "🔧 Standalone Mode Active",
            description: "All agents running locally without Coral Protocol",
          });
        }
      } catch (error) {
        console.error('Agent initialization failed:', error);
        toast({
          title: "🔧 Local Mode Active",
          description: "Agents running without Coral Protocol connectivity",
        });
      }
    };
    
    initializeAgents();
  }, [toast]);

  const generatePrompt = async () => {
    if (!userRequest.trim()) {
      toast({
        title: "Please enter a request",
        description: "Describe what kind of meditation music you'd like to create.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      let prompt: string;
      
      if (isAgentRegistered) {
        // Use Coral Protocol agent for generation
        prompt = await meditationMusicAgent.processRequest(userRequest, config);
      } else {
        // Fallback to standalone generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const instrumentsText = config.instruments.length > 0 
          ? config.instruments.join(', ') 
          : 'soft ambient pads, gentle nature sounds';
        
        prompt = `MEDITATION MUSIC PROMPT:
Generate a ${config.duration}-minute meditation soundscape in ${config.key} at ${config.tempo} BPM. Create a ${config.mood.toLowerCase()} composition featuring ${instrumentsText}. The music should evoke ${userRequest}, with seamless flow and minimal melodic movement, emphasizing sustained tones and gradual harmonic progressions.

TECHNICAL SPECIFICATIONS:
- Duration: ${config.duration} minutes
- Tempo: ${config.tempo} BPM
- Key: ${config.key}
- Fade-in: 30 seconds, Fade-out: 30 seconds
- Dynamic range: Soft to moderate (60-75 dB)

ATMOSPHERIC ELEMENTS:
- Spatial: ${config.atmosphere} with natural reverb
- Texture: Smooth, flowing, ethereal
- Filtering: Gentle low-pass for warmth
- Binaural elements: Subtle stereo separation for enhanced relaxation
- Volume dynamics: Consistent with gentle swells every 2-3 minutes
- Harmonic progression: Simple, resolved, tension-free

STANDALONE MODE:
- Generated: ${new Date().toISOString()}
- Note: Generated without Coral Protocol integration`;
      }

      setGeneratedPrompt(prompt);
      
      toast({
        title: "✨ Meditation music prompt generated!",
        description: isAgentRegistered 
          ? "Generated via Coral Protocol MCP agent"
          : "Generated in standalone mode",
      });
      
    } catch (error) {
      toast({
        title: "Generation failed", 
        description: "Please try again with your request.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleInstrument = (instrument: string) => {
    setConfig(prev => ({
      ...prev,
      instruments: prev.instruments.includes(instrument)
        ? prev.instruments.filter(i => i !== instrument)
        : [...prev.instruments, instrument]
    }));
  };

  const generateMusic = async () => {
    if (!generatedPrompt.trim()) {
      toast({
        title: "No prompt available",
        description: "Please generate a text prompt first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingMusic(true);
    try {
      const musicRequest = {
        id: `music-${Date.now()}`,
        textPrompt: generatedPrompt,
        musicConfig: {
          duration: config.duration * 60, // Convert minutes to seconds
          style: config.mood?.toLowerCase() || 'ambient meditation',
          tempo: config.tempo,
          key: config.key,
          mood: config.mood || 'peaceful',
          instruments: config.instruments,
          includeVocals: false
        },
        timestamp: new Date().toISOString()
      };

      const musicResult = await musicGenerationAgent.generateMusic(musicRequest);
      setGeneratedMusic(musicResult);
      
      toast({
        title: "🎵 Music Generated Successfully",
        description: `Generated ${Math.round(musicResult.duration)}s meditation track`,
      });
    } catch (error) {
      console.error('Music generation failed:', error);
      toast({
        title: "❌ Music Generation Failed",
        description: "Please try again or check your settings",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const downloadMusic = () => {
    if (!generatedMusic) return;
    
    const link = document.createElement('a');
    link.href = generatedMusic.audioUrl;
    link.download = `meditation-music-${Date.now()}.${generatedMusic.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "⬇️ Download Started",
      description: "Your meditation music is downloading",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-zen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-meditation rounded-full shadow-meditation">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-meditation bg-clip-text text-transparent">
              Meditation Music Generator
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your ideas into detailed prompts for AI music generation. 
            Powered by Coral Protocol for seamless agent integration.
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              🌊 Coral Protocol MCP Agent
              {isAgentRegistered ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-orange-500" />
              )}
            </Badge>
            {isAgentRegistered && (
              <Badge variant="outline" className="text-xs">
                Agent ID: meditation-music-generator-v1
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Describe Your Vision
                </CardTitle>
                <CardDescription>
                  What kind of meditation experience do you want to create?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="E.g., Create calming music for deep sleep with ocean waves and soft piano..."
                  value={userRequest}
                  onChange={(e) => setUserRequest(e.target.value)}
                  className="min-h-[120px] resize-none border-0 bg-zen/50"
                />
              </CardContent>
            </Card>

            {/* Configuration */}
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-accent" />
                  Music Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration" className="text-sm font-medium">
                      Duration: {config.duration} minutes
                    </Label>
                    <Slider
                      id="duration"
                      min={5}
                      max={60}
                      step={5}
                      value={[config.duration]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, duration: value }))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tempo" className="text-sm font-medium">
                      Tempo: {config.tempo} BPM
                    </Label>
                    <Slider
                      id="tempo"
                      min={50}
                      max={90}
                      step={5}
                      value={[config.tempo]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, tempo: value }))}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Musical Key</Label>
                    <Select value={config.key} onValueChange={(value) => setConfig(prev => ({ ...prev, key: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDITATION_KEYS.map(key => (
                          <SelectItem key={key} value={key}>{key}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Mood</Label>
                    <Select value={config.mood} onValueChange={(value) => setConfig(prev => ({ ...prev, mood: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDITATION_MOODS.map(mood => (
                          <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Instruments</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {MEDITATION_INSTRUMENTS.map(instrument => (
                      <Badge
                        key={instrument}
                        variant={config.instruments.includes(instrument) ? "default" : "outline"}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => toggleInstrument(instrument)}
                      >
                        {instrument}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button 
                onClick={generatePrompt} 
                disabled={isGenerating}
                className="w-full h-12 bg-gradient-meditation hover:opacity-90 transition-all shadow-meditation"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isAgentRegistered ? 'Generating via Coral Protocol...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {isAgentRegistered ? 'Generate with Coral Protocol' : 'Generate Music Prompt'}
                  </>
                )}
              </Button>
              
              {generatedPrompt && (
                <Button 
                  onClick={generateMusic}
                  disabled={isGeneratingMusic}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {isGeneratingMusic ? (
                    <>
                      <Music className="mr-2 h-4 w-4 animate-pulse" />
                      Generating Music... ({config.duration}min)
                    </>
                  ) : (
                    <>
                      <Music className="mr-2 h-4 w-4" />
                      Generate MP3 Music
                    </>
                  )}
                </Button>
              )}
              
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${isAgentRegistered ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                  Prompt {isAgentRegistered ? 'Connected' : 'Standalone'}
                </div>
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${isMusicAgentRegistered ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                  Music {isMusicAgentRegistered ? 'Connected' : 'Standalone'}
                </div>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div>
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Generated Music Prompt
                </CardTitle>
                <CardDescription>
                  Ready to use with your preferred AI music generation system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedPrompt ? (
                  <div className="space-y-4">
                    <pre className="whitespace-pre-wrap text-sm bg-zen/30 p-4 rounded-lg border max-h-[400px] overflow-y-auto">
                      {generatedPrompt}
                    </pre>
                    <Button 
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPrompt);
                        toast({ title: "Copied to clipboard!" });
                      }}
                      variant="outline" 
                      className="w-full"
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Your generated meditation music prompt will appear here</p>
                    <p className="text-sm mt-2">Complete the form and click generate to create your prompt</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Generated Music Section */}
        {generatedMusic && (
          <div className="mt-8">
            <Card className="border-purple-500/20 bg-gradient-to-br from-background to-purple-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Music className="h-5 w-5" />
                  Generated Meditation Music
                </CardTitle>
                <CardDescription>
                  AI-generated meditation soundscape ready for use
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm font-medium">Duration: {Math.round(generatedMusic.duration)}s</div>
                    <div className="text-sm text-muted-foreground">Model: {generatedMusic.model}</div>
                    <div className="text-sm text-muted-foreground">Format: {generatedMusic.format.toUpperCase()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Generated in</div>
                    <div className="text-xs text-muted-foreground">{generatedMusic.generationTime}ms</div>
                  </div>
                </div>

                <audio 
                  controls 
                  className="w-full"
                  src={generatedMusic.audioUrl}
                >
                  Your browser does not support the audio element.
                </audio>

                <div className="flex gap-2">
                  <Button
                    onClick={downloadMusic}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Audio
                  </Button>
                  <Button
                    onClick={() => setGeneratedMusic(null)}
                    variant="outline" 
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Powered by Coral Protocol MCP Agent Framework</p>
          <p className="mt-1">DiffRhythm & AudioCraft integration for full meditation music generation</p>
        </div>
      </div>
    </div>
  );
};