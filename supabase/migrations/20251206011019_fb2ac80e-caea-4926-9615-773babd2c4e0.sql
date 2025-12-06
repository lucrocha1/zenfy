-- Add daily_goal column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN daily_goal INTEGER NOT NULL DEFAULT 10;

-- Comment for documentation
COMMENT ON COLUMN public.profiles.daily_goal IS 'User daily meditation goal in minutes';