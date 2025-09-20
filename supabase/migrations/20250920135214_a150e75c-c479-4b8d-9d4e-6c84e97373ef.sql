-- Create agents registry table
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  endpoint TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent API keys table
CREATE TABLE public.agent_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent usage logs table
CREATE TABLE public.agent_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  api_key_id UUID NOT NULL REFERENCES public.agent_api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_data JSONB,
  response_data JSONB,
  status_code INTEGER,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to agents (for discovery)
CREATE POLICY "Agents are publicly readable" 
ON public.agents 
FOR SELECT 
USING (true);

-- Create policies for API keys (only accessible by authenticated users)
CREATE POLICY "Users can manage their API keys" 
ON public.agent_api_keys 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create policies for usage logs (only accessible by authenticated users)
CREATE POLICY "Users can view usage logs" 
ON public.agent_usage_logs 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create storage buckets for music files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('music-files', 'music-files', true);

-- Create storage policies for music files
CREATE POLICY "Music files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'music-files');

CREATE POLICY "Anyone can upload music files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'music-files');

-- Insert the ElevenLabs Music Generator agent
INSERT INTO public.agents (name, description, capabilities, endpoint, metadata) VALUES (
  'ElevenLabs Music Generator',
  'AI music generation using ElevenLabs API with customizable prompts, duration, style, mood, and instruments',
  ARRAY['text-to-music', 'audio-generation'],
  '/agents/music-generator',
  jsonb_build_object(
    'maxDuration', 300,
    'supportsVocals', true,
    'supportedFormats', ARRAY['mp3'],
    'parameters', jsonb_build_object(
      'prompt', jsonb_build_object('type', 'string', 'required', true),
      'duration', jsonb_build_object('type', 'integer', 'min', 10, 'max', 300, 'default', 60),
      'style', jsonb_build_object('type', 'string', 'enum', ARRAY['ambient', 'classical', 'electronic', 'rock', 'jazz', 'folk']),
      'mood', jsonb_build_object('type', 'string', 'enum', ARRAY['peaceful', 'energetic', 'dark', 'uplifting', 'mysterious']),
      'tempo', jsonb_build_object('type', 'string', 'enum', ARRAY['slow', 'medium', 'fast']),
      'key', jsonb_build_object('type', 'string', 'enum', ARRAY['C major', 'C minor', 'D major', 'D minor', 'E major', 'E minor'])
    )
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_api_keys_updated_at
  BEFORE UPDATE ON public.agent_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();