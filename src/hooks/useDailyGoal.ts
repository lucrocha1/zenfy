import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const LOCAL_STORAGE_KEY = 'meditation_daily_goal';
const DEFAULT_GOAL = 10;

export const useDailyGoal = () => {
  const { user } = useAuth();
  const [dailyGoal, setDailyGoal] = useState<number>(DEFAULT_GOAL);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch daily goal from database
  const fetchDailyGoal = useCallback(async () => {
    if (!user) {
      // Fallback to localStorage for non-authenticated users
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      setDailyGoal(saved ? parseInt(saved) : DEFAULT_GOAL);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('daily_goal')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching daily goal:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      setDailyGoal(saved ? parseInt(saved) : DEFAULT_GOAL);
    } else if (data) {
      setDailyGoal(data.daily_goal);
      // Sync to localStorage as backup
      localStorage.setItem(LOCAL_STORAGE_KEY, String(data.daily_goal));
    }

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDailyGoal();
  }, [fetchDailyGoal]);

  // Save daily goal to database
  const saveDailyGoal = useCallback(async (minutes: number) => {
    // Update local state immediately
    setDailyGoal(minutes);
    // Always save to localStorage as backup
    localStorage.setItem(LOCAL_STORAGE_KEY, String(minutes));

    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ daily_goal: minutes })
      .eq('id', user.id);

    if (error) {
      console.error('Error saving daily goal:', error);
    }
  }, [user]);

  return { dailyGoal, saveDailyGoal, isLoading };
};
