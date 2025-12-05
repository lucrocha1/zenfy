-- Create streak_freezes table
CREATE TABLE public.streak_freezes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  freeze_date date NOT NULL,
  used_at timestamptz NOT NULL DEFAULT now(),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, freeze_date)
);

-- Enable RLS
ALTER TABLE public.streak_freezes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for streak_freezes
CREATE POLICY "Users can view own freezes" ON public.streak_freezes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own freezes" ON public.streak_freezes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own freezes" ON public.streak_freezes
  FOR DELETE USING (auth.uid() = user_id);

-- Create challenge_type enum
CREATE TYPE public.challenge_type AS ENUM ('cave_mode', 'reset', 'custom');

-- Create challenge_status enum
CREATE TYPE public.challenge_status AS ENUM ('active', 'completed', 'failed', 'abandoned');

-- Create user_challenges table
CREATE TABLE public.user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_type challenge_type NOT NULL,
  name text NOT NULL,
  target_days integer NOT NULL CHECK (target_days > 0),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status challenge_status NOT NULL DEFAULT 'active',
  progress_days integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_challenges
CREATE POLICY "Users can view own challenges" ON public.user_challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges" ON public.user_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges" ON public.user_challenges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenges" ON public.user_challenges
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_challenges_updated_at
  BEFORE UPDATE ON public.user_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();