-- Create meditation sessions table
CREATE TABLE public.meditation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (anyone can read/write their own device data)
CREATE POLICY "Anyone can view their device sessions"
ON public.meditation_sessions
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert sessions"
ON public.meditation_sessions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete their device sessions"
ON public.meditation_sessions
FOR DELETE
USING (true);

-- Create index for faster device_id queries
CREATE INDEX idx_meditation_sessions_device_id ON public.meditation_sessions(device_id);
CREATE INDEX idx_meditation_sessions_date ON public.meditation_sessions(date);