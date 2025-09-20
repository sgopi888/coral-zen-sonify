import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Music, Clock, Volume2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { meditationMusicAgent } from './CoralProtocolAgent';

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
  const { toast } = useToast();

  // Initialize Coral Protocol agent on component mount
  useEffect(() => {
    const initializeAgent = async () => {
      try {
        const registered = await meditationMusicAgent.register();
        setIsAgentRegistered(registered);
        if (registered) {
          toast({
            title: "🌊 Coral Protocol Connected",
            description: "Meditation Music Generator agent is now online and ready.",
          });
        }
      } catch (error) {
        console.error('Failed to initialize Coral Protocol agent:', error);
        toast({
          title: "Agent initialization failed",
          description: "Running in standalone mode without Coral Protocol.",
          variant: "destructive"
        });
      }
    };
    
    initializeAgent();
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

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Powered by Coral Protocol MCP Agent Framework</p>
          <p className="mt-1">Designed for seamless integration with AI music generation systems</p>
        </div>
      </div>
    </div>
  );
};