/**
 * Professional ElevenLabs Music Studio
 * Professional AI music generation powered by ElevenLabs
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Music, Clock, Download, Play, Pause, Volume2, Headphones, Mic, Radio, User, Library } from 'lucide-react';
import { ElevenLabsOnlyProvider, ElevenLabsConfig, ElevenLabsResponse } from '@/providers/ElevenLabsOnlyProvider';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { MusicPlayer } from './MusicPlayer';

interface MusicTrack {
  id: string;
  title: string;
  file_url: string;
  duration?: number;
  prompt: string;
  style?: string;
  mood?: string;
  created_at: string;
}

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
  const [generationProgress, setGenerationProgress] = useState(0);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);

  const { toast } = useToast();
  const provider = new ElevenLabsOnlyProvider();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMusicTracks();
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchMusicTracks();
        } else {
          setMusicTracks([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchMusicTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('music_tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMusicTracks(data || []);
    } catch (error) {
      console.error('Error fetching music tracks:', error);
    }
  };

  const saveGeneratedTrack = async (response: ElevenLabsResponse) => {
    if (!user) return;

    try {
      // Create a descriptive title based on the prompt
      const title = prompt.length > 50 ? `${prompt.substring(0, 47)}...` : prompt;
      
      const { error } = await supabase
        .from('music_tracks')
        .insert({
          user_id: user.id,
          title,
          prompt,
          file_url: response.audioUrl,
          duration: response.duration,
          style,
          mood,
          tempo: tempo[0],
          key,
          instruments
        });

      if (error) throw error;

      // Refresh the tracks list
      await fetchMusicTracks();
      
      toast({
        title: "Track Saved! 💾",
        description: "Your generated music has been saved to your library",
      });
    } catch (error) {
      console.error('Error saving track:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save track to your library",
        variant: "destructive",
      });
    }
  };

  const deleteMusicTrack = async (trackId: string) => {
    try {
      const { error } = await supabase
        .from('music_tracks')
        .delete()
        .eq('id', trackId);

      if (error) throw error;

      // Refresh the music tracks list
      await fetchMusicTracks();
      
      toast({
        title: "Success",
        description: "Track deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting track:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete track",
        variant: "destructive",
      });
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
    setGenerationProgress(0);
    console.log('🚀 Starting ElevenLabs generation...');
    
    // Simulate progress for user feedback
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);
    
    const config: ElevenLabsConfig = {
      duration: duration[0],
      style,
      mood,
      instruments,
      tempo: tempo[0],
      key,
    };

    try {
      const response = await provider.generateMusic(prompt, config);
      
      console.log('✅ Music generated successfully:', response);
      setGenerationProgress(100);
      setGeneratedMusic(response);
      
      // Save to database if user is logged in
      if (user) {
        await saveGeneratedTrack(response);
      }
      
      toast({
        title: "Music Generated Successfully! 🎵",
        description: `Generated ${response.duration}s track. ${user ? 'Saved to your library!' : 'Sign in to save tracks to your library.'}`,
      });
    } catch (error) {
      console.error('❌ ElevenLabs generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
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
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      {/* Professional Studio Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-3 rounded-full bg-gradient-studio shadow-studio">
            <Headphones className="h-8 w-8 text-white" />
          </div>
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-primary to-transparent"></div>
          <div className="p-3 rounded-full bg-gradient-waveform shadow-waveform">
            <Radio className="h-8 w-8 text-white" />
          </div>
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-accent to-transparent"></div>
          <div className="p-3 rounded-full bg-gradient-audio shadow-glow">
            <Mic className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold bg-gradient-studio bg-clip-text text-transparent mb-4">
          ElevenLabs Music Studio
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Professional AI music generation powered by ElevenLabs
        </p>

        {/* User Status */}
        {user && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              <User className="h-3 w-3 mr-1" />
              {user.email?.split('@')[0]}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Library className="h-3 w-3 mr-1" />
              {musicTracks.length} tracks saved
            </Badge>
          </div>
        )}

        {/* Studio Visualizer */}
        <div className="mt-8 flex items-center justify-center gap-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-waveform rounded-full opacity-70 animate-pulse-soft"
              style={{
                height: `${Math.random() * 40 + 10}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Professional Music Generation Interface */}
      <Card className="border-0 bg-gradient-to-br from-card via-card/95 to-peaceful/5 shadow-studio">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-lg bg-gradient-studio shadow-soft">
              <Music className="h-6 w-6 text-white" />
            </div>
            Composition Studio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Creative Prompt */}
          <div className="space-y-4">
            <label className="text-lg font-semibold text-foreground">Creative Brief</label>
            <div className="relative">
              <textarea
                className="w-full h-36 p-4 border-2 border-muted-foreground/20 rounded-xl resize-none text-sm leading-relaxed bg-gradient-to-br from-background to-meditation/10 focus:border-primary focus:shadow-soft transition-all duration-300"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your musical vision in detail..."
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                {prompt.length} characters
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Core Parameters */}
            <div className="space-y-6">
              {/* Duration Control */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-base font-medium">Track Length</label>
                  <Badge variant="secondary" className="px-3 py-1">
                    {duration[0]}s
                  </Badge>
                </div>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  max={300}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Style & Mood */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-base font-medium">Genre</label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="h-11">
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

                <div className="space-y-3">
                  <label className="text-base font-medium">Mood</label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger className="h-11">
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

              {/* Tempo Control */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-base font-medium">Tempo</label>
                  <Badge variant="secondary" className="px-3 py-1">
                    {tempo[0]} BPM
                  </Badge>
                </div>
                <Slider
                  value={tempo}
                  onValueChange={setTempo}
                  max={180}
                  min={40}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Right Column - Advanced Parameters */}
            <div className="space-y-6">
              {/* Key Signature */}
              <div className="space-y-3">
                <label className="text-base font-medium">Key Signature</label>
                <Select value={key} onValueChange={setKey}>
                  <SelectTrigger className="h-11">
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

              {/* Instrument Palette */}
              <div className="space-y-4">
                <label className="text-base font-medium">Instrument Palette</label>
                <div className="grid grid-cols-3 gap-2">
                  {instrumentOptions.map((instrument) => (
                    <Badge
                      key={instrument}
                      variant={instruments.includes(instrument) ? "default" : "outline"}
                      className="cursor-pointer py-2 px-3 text-center capitalize hover:scale-105 transition-transform"
                      onClick={() => toggleInstrument(instrument)}
                    >
                      {instrument}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Generate Button */}
          <Button 
            onClick={generateMusic}
            disabled={isGenerating || !prompt.trim()}
            className="w-full h-14 text-lg bg-gradient-studio hover:shadow-studio transition-all duration-300"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Clock className="mr-3 h-6 w-6 animate-spin" />
                Composing Your Music...
              </>
            ) : (
              <>
                <Music className="mr-3 h-6 w-6" />
                Generate Professional Track
              </>
            )}
          </Button>
          
          {/* Progress Visualization */}
          {isGenerating && (
            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Radio className="h-4 w-4 animate-pulse" />
                  Creating your masterpiece...
                </span>
                <span className="font-medium">{Math.round(generationProgress)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-studio h-4 rounded-full transition-all duration-700 ease-out shadow-glow"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                High-quality audio synthesis in progress...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Audio Player */}
      {generatedMusic && generatedMusic.audioUrl && (
        <Card className="border-0 bg-gradient-to-r from-card via-meditation/5 to-peaceful/5 shadow-meditation">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-waveform shadow-soft">
                <Volume2 className="h-5 w-5 text-white" />
              </div>
              Your Generated Track
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-background/50 to-meditation/10 rounded-xl border border-muted-foreground/10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gradient-audio shadow-glow">
                  <Music className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Professional Mix</p>
                  <p className="text-muted-foreground">
                    {generatedMusic.duration}s • {generatedMusic.format.toUpperCase()} • Studio Quality
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={togglePlayback} 
                  variant="outline" 
                  size="lg"
                  className="h-12 w-12 rounded-full border-2 hover:shadow-soft transition-all duration-300"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </Button>
                <Button 
                  onClick={downloadMusic} 
                  variant="outline" 
                  size="lg"
                  className="h-12 px-6 hover:shadow-soft transition-all duration-300"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Music Library Section */}
      {user && musicTracks.length > 0 && (
        <Card className="border-0 bg-gradient-to-br from-card via-card/95 to-peaceful/5 shadow-studio">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-gradient-audio shadow-soft">
                <Library className="h-5 w-5 text-white" />
              </div>
              Your Music Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MusicPlayer 
              tracks={musicTracks}
              onDeleteTrack={deleteMusicTrack}
              showDeleteButton={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Sign In Prompt for Guests */}
      {!user && (
        <Card className="border-0 bg-gradient-to-r from-card via-meditation/5 to-peaceful/5 shadow-meditation">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="p-3 rounded-full bg-gradient-studio shadow-glow mx-auto w-fit">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Save Your Creations</h3>
                <p className="text-muted-foreground">
                  Sign in to save your generated music tracks, create playlists, and access your personal music library.
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="mt-4 bg-gradient-studio hover:shadow-studio transition-all duration-300"
              >
                Sign In to Save Music
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};