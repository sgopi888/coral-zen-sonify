-- Fix security issues with API keys and usage logs

-- Add user_id column to agent_api_keys table if it doesn't exist
ALTER TABLE public.agent_api_keys ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing API keys to have a user_id (for development - remove if you want fresh start)
-- UPDATE public.agent_api_keys SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Make user_id NOT NULL after adding the column
ALTER TABLE public.agent_api_keys ALTER COLUMN user_id SET NOT NULL;

-- Add user_id column to agent_usage_logs table if it doesn't exist  
ALTER TABLE public.agent_usage_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make user_id NOT NULL
ALTER TABLE public.agent_usage_logs ALTER COLUMN user_id SET NOT NULL;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can manage their API keys" ON public.agent_api_keys;
DROP POLICY IF EXISTS "Users can view usage logs" ON public.agent_usage_logs;

-- Create secure RLS policies for agent_api_keys
CREATE POLICY "Users can view their own API keys" 
ON public.agent_api_keys 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys" 
ON public.agent_api_keys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" 
ON public.agent_api_keys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" 
ON public.agent_api_keys 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create secure RLS policies for agent_usage_logs  
CREATE POLICY "Users can view their own usage logs" 
ON public.agent_usage_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage logs" 
ON public.agent_usage_logs 
FOR INSERT 
WITH CHECK (true); -- Allow system to log usage, but users can only view their own