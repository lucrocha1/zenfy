-- Add user_id column to meditation_sessions
ALTER TABLE public.meditation_sessions 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view own device sessions" ON public.meditation_sessions;
DROP POLICY IF EXISTS "Users can insert own device sessions" ON public.meditation_sessions;
DROP POLICY IF EXISTS "Users can delete own device sessions" ON public.meditation_sessions;

-- Create new RLS policies based on user_id
CREATE POLICY "Users can view own sessions" 
ON public.meditation_sessions 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sessions" 
ON public.meditation_sessions 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions" 
ON public.meditation_sessions 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions" 
ON public.meditation_sessions 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());