-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view their device sessions" ON public.meditation_sessions;
DROP POLICY IF EXISTS "Anyone can insert sessions" ON public.meditation_sessions;
DROP POLICY IF EXISTS "Anyone can delete their device sessions" ON public.meditation_sessions;

-- Create secure policies that validate device_id from request headers
CREATE POLICY "Users can view own device sessions"
ON public.meditation_sessions FOR SELECT
USING (device_id = current_setting('request.headers', true)::json->>'x-device-id');

CREATE POLICY "Users can insert own device sessions"
ON public.meditation_sessions FOR INSERT
WITH CHECK (device_id = current_setting('request.headers', true)::json->>'x-device-id');

CREATE POLICY "Users can delete own device sessions"
ON public.meditation_sessions FOR DELETE
USING (device_id = current_setting('request.headers', true)::json->>'x-device-id');