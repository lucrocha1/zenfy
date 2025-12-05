-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.meditation_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.meditation_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.meditation_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.meditation_sessions;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Users can view own sessions" 
ON public.meditation_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" 
ON public.meditation_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" 
ON public.meditation_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" 
ON public.meditation_sessions 
FOR DELETE 
USING (auth.uid() = user_id);