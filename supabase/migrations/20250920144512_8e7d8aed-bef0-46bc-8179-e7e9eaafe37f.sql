-- Create table for storing user's generated music tracks
CREATE TABLE public.music_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  file_url TEXT NOT NULL,
  duration INTEGER, -- in seconds
  style TEXT,
  mood TEXT,
  tempo INTEGER,
  key TEXT,
  instruments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

-- Create policies for music tracks
CREATE POLICY "Users can view their own music tracks" 
ON public.music_tracks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own music tracks" 
ON public.music_tracks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own music tracks" 
ON public.music_tracks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own music tracks" 
ON public.music_tracks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_music_tracks_updated_at
BEFORE UPDATE ON public.music_tracks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();