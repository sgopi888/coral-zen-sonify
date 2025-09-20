import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Square, Volume2, VolumeX, SkipBack, SkipForward, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: string;
  title: string;
  file_url: string;
  duration?: number;
  prompt: string;
  style?: string;
  mood?: string;
}

interface MusicPlayerProps {
  tracks: Track[];
  onDeleteTrack?: (trackId: string) => void;
  showDeleteButton?: boolean;
}

export function MusicPlayer({ tracks, onDeleteTrack, showDeleteButton = false }: MusicPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (!waveformRef.current || !currentTrack) return;

    // Destroy existing instance
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }

    // Create new WaveSurfer instance
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgb(147, 51, 234)',
      progressColor: 'rgb(99, 102, 241)',
      cursorColor: 'rgb(59, 130, 246)',
      barWidth: 2,
      barRadius: 3,
      height: 60,
      normalize: true,
      backend: 'WebAudio',
    });

    // Set up event listeners
    wavesurfer.current.on('ready', () => {
      setIsLoading(false);
      setDuration(wavesurfer.current?.getDuration() || 0);
    });

    wavesurfer.current.on('audioprocess', () => {
      setCurrentTime(wavesurfer.current?.getCurrentTime() || 0);
    });

    wavesurfer.current.on('finish', () => {
      setIsPlaying(false);
      handleNext();
    });

    wavesurfer.current.on('error', (error) => {
      console.error('WaveSurfer error:', error);
      toast({
        title: "Playback Error",
        description: "Failed to load audio file",
        variant: "destructive"
      });
      setIsLoading(false);
    });

    // Load the track
    setIsLoading(true);
    wavesurfer.current.load(currentTrack.file_url);

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [currentTrack]);

  const handlePlayPause = () => {
    if (!wavesurfer.current) return;

    if (isPlaying) {
      wavesurfer.current.pause();
      setIsPlaying(false);
    } else {
      wavesurfer.current.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (!wavesurfer.current) return;
    wavesurfer.current.stop();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(false);
  };

  const handlePrevious = () => {
    if (tracks.length === 0) return;
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(false);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (wavesurfer.current) {
      wavesurfer.current.setVolume(newVolume);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (wavesurfer.current) {
      wavesurfer.current.setVolume(newMuted ? 0 : volume);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDeleteTrack = () => {
    if (currentTrack && onDeleteTrack) {
      onDeleteTrack(currentTrack.id);
    }
  };

  if (!tracks.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No tracks available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Track Info */}
          <div className="text-center">
            <h3 className="font-semibold text-lg">{currentTrack?.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{currentTrack?.prompt}</p>
            <div className="flex justify-center gap-2 mt-1">
              {currentTrack?.style && (
                <span className="text-xs bg-muted px-2 py-1 rounded">{currentTrack.style}</span>
              )}
              {currentTrack?.mood && (
                <span className="text-xs bg-muted px-2 py-1 rounded">{currentTrack.mood}</span>
              )}
            </div>
          </div>

          {/* Waveform */}
          <div className="relative">
            <div ref={waveformRef} className={isLoading ? 'opacity-50' : ''} />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          {/* Time Display */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={tracks.length <= 1}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              disabled={isLoading}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleStop}
            >
              <Square className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={tracks.length <= 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            {/* Volume Control */}
            <div className="flex items-center gap-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-16"
              />
            </div>

            {showDeleteButton && onDeleteTrack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteTrack}
                className="ml-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Playlist */}
          {tracks.length > 1 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Playlist ({tracks.length} tracks)</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => setCurrentTrackIndex(index)}
                    className={`w-full text-left p-2 rounded text-xs hover:bg-muted transition-colors ${
                      index === currentTrackIndex ? 'bg-muted font-medium' : ''
                    }`}
                  >
                    <div className="truncate">{track.title}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}