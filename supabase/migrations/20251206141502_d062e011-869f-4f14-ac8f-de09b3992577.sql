-- Make user_id NOT NULL for data integrity
-- First, delete any orphaned records (should be none)
DELETE FROM meditation_sessions WHERE user_id IS NULL;

-- Then add NOT NULL constraint
ALTER TABLE meditation_sessions ALTER COLUMN user_id SET NOT NULL;