import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useMeditationSessions } from './useMeditationSessions';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';

interface StreakFreeze {
  id: string;
  user_id: string;
  freeze_date: string;
  used_at: string;
  reason: string | null;
}

export const useStreakFreeze = () => {
  const { user } = useAuth();
  const { sessions } = useMeditationSessions();
  const [freezes, setFreezes] = useState<StreakFreeze[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate available freezes based on streaks
  // Start with 2, earn 1 per 7 consecutive days (max 5)
  const calculateAvailableFreezes = useCallback(() => {
    const usedCount = freezes.length;
    
    // Count how many 7-day milestones user has achieved
    // For simplicity: 1 bonus freeze per 7 total sessions
    const earnedFromMilestones = Math.floor(sessions.length / 7);
    const baseAmount = 2;
    const maxFreezes = 5;
    
    const totalEarned = Math.min(baseAmount + earnedFromMilestones, maxFreezes);
    return Math.max(0, totalEarned - usedCount);
  }, [sessions.length, freezes.length]);

  const fetchFreezes = useCallback(async () => {
    if (!user) {
      setFreezes([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('streak_freezes')
        .select('*')
        .eq('user_id', user.id)
        .order('freeze_date', { ascending: false });

      if (error) throw error;
      setFreezes(data || []);
    } catch (error) {
      console.error('Error fetching streak freezes:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFreezes();
  }, [fetchFreezes]);

  const useFreeze = useCallback(async (date?: Date) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return false;
    }

    const availableFreezes = calculateAvailableFreezes();
    if (availableFreezes <= 0) {
      toast.error('Você não tem streak freezes disponíveis');
      return false;
    }

    const freezeDate = date || subDays(new Date(), 1);
    const formattedDate = format(freezeDate, 'yyyy-MM-dd');

    // Check if already used for this date
    if (freezes.some(f => f.freeze_date === formattedDate)) {
      toast.error('Você já usou um freeze para este dia');
      return false;
    }

    try {
      const { error } = await supabase
        .from('streak_freezes')
        .insert({
          user_id: user.id,
          freeze_date: formattedDate,
          reason: 'Protegido streak',
        });

      if (error) throw error;

      toast.success('❄️ Streak freeze usado!', {
        description: `Seu streak foi protegido para ${format(freezeDate, 'dd/MM')}`,
      });

      await fetchFreezes();
      return true;
    } catch (error) {
      console.error('Error using streak freeze:', error);
      toast.error('Erro ao usar streak freeze');
      return false;
    }
  }, [user, freezes, calculateAvailableFreezes, fetchFreezes]);

  // Check if yesterday was missed (candidate for freeze)
  const canUseFreeze = useCallback(() => {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const hadSessionYesterday = sessions.some(s => s.date === yesterday);
    const alreadyFrozen = freezes.some(f => f.freeze_date === yesterday);
    
    return !hadSessionYesterday && !alreadyFrozen && calculateAvailableFreezes() > 0;
  }, [sessions, freezes, calculateAvailableFreezes]);

  // Get freeze dates for streak calculation
  const getFreezeDates = useCallback(() => {
    return freezes.map(f => f.freeze_date);
  }, [freezes]);

  return {
    freezes,
    loading,
    availableFreezes: calculateAvailableFreezes(),
    useFreeze,
    canUseFreeze,
    getFreezeDates,
    refetch: fetchFreezes,
  };
};
