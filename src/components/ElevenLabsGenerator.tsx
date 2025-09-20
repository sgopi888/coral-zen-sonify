/**
 * ElevenLabs-Only Music Generator Component
 * Pure ElevenLabs implementation with no demo fallback
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Music, Clock, Download, Play, Pause, Volume2, AlertCircle, CheckCircle } from 'lucide-react';
import { ElevenLabsOnlyProvider, ElevenLabsConfig, ElevenLabsResponse } from '@/providers/ElevenLabsOnlyProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ElevenLabsGenerator = () => {
  const [prompt, setPrompt] = useState(
    "Create a peaceful piano meditation composition with gentle, flowing melodies. Use soft, contemplative chord progressions in a minor key. Include subtle ambient textures and nature sounds like gentle rain or flowing water. The tempo should be slow and calming, around 60-70 BPM. Focus on creating a serene atmosphere perfect for deep meditation and stress relief."
  );
  const [duration, setDuration] = useState<number[]>([60]);
  const [style, setStyle] = useState("ambient");
  const [mood, setMood] = useState("peaceful");
  const [tempo, setTempo] = useState<number[]>([70]);
  const [key, setKey] = useState("C minor");
  const [instruments, setInstruments] = useState<string[]>(["piano", "strings"]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [generatedMusic, setGeneratedMusic] = useState<ElevenLabsResponse | null>(null);
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'error'>('checking');

  const { toast } = useToast();
  const provider = new ElevenLabsOnlyProvider();

  React.useEffect(() => {
    checkProviderHealth();
  }, []);

  const checkProviderHealth = async () => {
    setHealthStatus('checking');
    try {
      const isHealthy = await provider.checkHealth();
      setHealthStatus(isHealthy ? 'healthy' : 'error');
    } catch (error) {
      setHealthStatus('error');
    }
  };

  const generateMusic = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a music generation prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    const config: ElevenLabsConfig = {
      duration: duration[0],
      style,
      mood,
      instruments,
      tempo: tempo[0],
      key,
    };

    try {
      console.log('🚀 Starting ElevenLabs generation...');
      const response = await provider.generateMusic(prompt, config);
      
      console.log('✅ Music generated successfully:', response);
      setGeneratedMusic(response);
      toast({
        title: "Music Generated Successfully",
        description: `Generated ${response.duration}s track with ElevenLabs. Download option now available!`,
      });
    } catch (error) {
      console.error('❌ ElevenLabs generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!generatedMusic?.audioUrl) return;

    if (currentAudio && isPlaying) {
      currentAudio.pause();
      setIsPlaying(false);
    } else {
      if (currentAudio) {
        currentAudio.pause();
      }
      
      const audio = new Audio(generatedMusic.audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setCurrentAudio(audio);
      setIsPlaying(true);
    }
  };

  const downloadMusic = () => {
    if (generatedMusic?.audioUrl) {
      const a = document.createElement('a');
      a.href = generatedMusic.audioUrl;
      a.download = `elevenlabs-music-${Date.now()}.${generatedMusic.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const instrumentOptions = [
    "piano", "strings", "guitar", "violin", "cello", "flute", "clarinet",
    "trumpet", "saxophone", "drums", "bass", "synthesizer", "harp", "choir"
  ];

  const toggleInstrument = (instrument: string) => {
    setInstruments(prev => 
      prev.includes(instrument) 
        ? prev.filter(i => i !== instrument)
        : [...prev, instrument]
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          ElevenLabs Music Generator
        </h1>
        <p className="text-muted-foreground text-lg">
          Professional AI music generation powered by ElevenLabs
        </p>
        
        {/* Health Status */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {healthStatus === 'checking' && (
            <Badge variant="secondary">Checking ElevenLabs API...</Badge>
          )}
          {healthStatus === 'healthy' && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              ElevenLabs API Ready
            </Badge>
          )}
          {healthStatus === 'error' && (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              ElevenLabs API Error
            </Badge>
          )}
        </div>
      </div>

      {healthStatus === 'error' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to connect to ElevenLabs API. Please check your API key configuration and try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Music Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Music Generation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Music Prompt</label>
            <textarea
              className="w-full h-32 p-3 border rounded-lg resize-none text-sm"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the music you want to generate..."
            />
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Duration: {duration[0]} seconds</label>
            <Slider
              value={duration}
              onValueChange={setDuration}
              max={300}
              min={10}
              step={5}
              className="w-full"
            />
          </div>

          {/* Style and Mood */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Style</label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ambient">Ambient</SelectItem>
                  <SelectItem value="classical">Classical</SelectItem>
                  <SelectItem value="electronic">Electronic</SelectItem>
                  <SelectItem value="jazz">Jazz</SelectItem>
                  <SelectItem value="folk">Folk</SelectItem>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                  <SelectItem value="meditation">Meditation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mood</label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peaceful">Peaceful</SelectItem>
                  <SelectItem value="energetic">Energetic</SelectItem>
                  <SelectItem value="melancholic">Melancholic</SelectItem>
                  <SelectItem value="uplifting">Uplifting</SelectItem>
                  <SelectItem value="mysterious">Mysterious</SelectItem>
                  <SelectItem value="romantic">Romantic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tempo */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Tempo: {tempo[0]} BPM</label>
            <Slider
              value={tempo}
              onValueChange={setTempo}
              max={180}
              min={40}
              step={5}
              className="w-full"
            />
          </div>

          {/* Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Key Signature</label>
            <Select value={key} onValueChange={setKey}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="C major">C Major</SelectItem>
                <SelectItem value="C minor">C Minor</SelectItem>
                <SelectItem value="D major">D Major</SelectItem>
                <SelectItem value="D minor">D Minor</SelectItem>
                <SelectItem value="E major">E Major</SelectItem>
                <SelectItem value="E minor">E Minor</SelectItem>
                <SelectItem value="F major">F Major</SelectItem>
                <SelectItem value="F minor">F Minor</SelectItem>
                <SelectItem value="G major">G Major</SelectItem>
                <SelectItem value="G minor">G Minor</SelectItem>
                <SelectItem value="A major">A Major</SelectItem>
                <SelectItem value="A minor">A Minor</SelectItem>
                <SelectItem value="B major">B Major</SelectItem>
                <SelectItem value="B minor">B Minor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Instruments */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Instruments</label>
            <div className="flex flex-wrap gap-2">
              {instrumentOptions.map((instrument) => (
                <Badge
                  key={instrument}
                  variant={instruments.includes(instrument) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleInstrument(instrument)}
                >
                  {instrument}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Generate Button */}
          <Button 
            onClick={generateMusic}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Generating with ElevenLabs...
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

      {/* Generated Music Player */}
      {generatedMusic && generatedMusic.audioUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Generated Music
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">ElevenLabs Music</p>
                <p className="text-sm text-muted-foreground">
                  {generatedMusic.duration}s • {generatedMusic.format.toUpperCase()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={togglePlayback} variant="outline" size="sm">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button onClick={downloadMusic} variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Metadata */}
            {generatedMusic.metadata.composition_plan && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <strong>Composition Plan:</strong> Generated with ElevenLabs Music API
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};