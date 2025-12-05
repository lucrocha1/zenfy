import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { format, addDays, differenceInDays, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import { toast } from 'sonner';

export type ChallengeType = 'cave_mode' | 'reset' | 'custom';
export type ChallengeStatus = 'active' | 'completed' | 'failed' | 'abandoned';

export interface Challenge {
  id: string;
  user_id: string;
  challenge_type: ChallengeType;
  name: string;
  target_days: number;
  start_date: string;
  end_date: string;
  status: ChallengeStatus;
  progress_days: number;
  created_at: string;
  updated_at: string;
}

export const CHALLENGE_PRESETS = [
  { type: 'cave_mode' as ChallengeType, name: 'Cave Mode', icon: '🕯️', description: 'Meditação diária sem falhar' },
  { type: 'reset' as ChallengeType, name: 'Reset', icon: '🔄', description: 'Recomeçar do zero' },
  { type: 'custom' as ChallengeType, name: 'Personalizado', icon: '📅', description: 'Crie seu próprio desafio' },
];

export const DAY_OPTIONS = [7, 14, 21, 30, 60, 90];

export const useChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    if (!user) {
      setChallenges([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges((data || []) as Challenge[]);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const activeChallenge = challenges.find(c => c.status === 'active');

  const createChallenge = useCallback(async (
    type: ChallengeType,
    targetDays: number,
    customName?: string
  ) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return null;
    }

    if (activeChallenge) {
      toast.error('Você já tem um desafio ativo');
      return null;
    }

    const preset = CHALLENGE_PRESETS.find(p => p.type === type);
    const name = customName || preset?.name || 'Desafio';
    const startDate = format(new Date(), 'yyyy-MM-dd');
    const endDate = format(addDays(new Date(), targetDays - 1), 'yyyy-MM-dd');

    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_type: type,
          name,
          target_days: targetDays,
          start_date: startDate,
          end_date: endDate,
          status: 'active',
          progress_days: 0,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('🚀 Desafio criado!', {
        description: `${name} - ${targetDays} dias`,
      });

      await fetchChallenges();
      return data as Challenge;
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('Erro ao criar desafio');
      return null;
    }
  }, [user, activeChallenge, fetchChallenges]);

  const updateChallengeProgress = useCallback(async (
    challengeId: string,
    progressDays: number,
    status?: ChallengeStatus
  ) => {
    try {
      const updateData: Record<string, unknown> = { progress_days: progressDays };
      if (status) updateData.status = status;

      const { error } = await supabase
        .from('user_challenges')
        .update(updateData)
        .eq('id', challengeId);

      if (error) throw error;
      await fetchChallenges();
    } catch (error) {
      console.error('Error updating challenge:', error);
    }
  }, [fetchChallenges]);

  const abandonChallenge = useCallback(async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('user_challenges')
        .update({ status: 'abandoned' })
        .eq('id', challengeId);

      if (error) throw error;

      toast.info('Desafio abandonado');
      await fetchChallenges();
    } catch (error) {
      console.error('Error abandoning challenge:', error);
      toast.error('Erro ao abandonar desafio');
    }
  }, [fetchChallenges]);

  // Calculate progress based on meditation sessions
  const calculateProgress = useCallback((challenge: Challenge, sessions: { date: string }[]) => {
    const startDate = parseISO(challenge.start_date);
    const today = startOfDay(new Date());
    
    let consecutiveDays = 0;
    let failed = false;
    
    for (let i = 0; i < challenge.target_days; i++) {
      const checkDate = addDays(startDate, i);
      
      // Don't check future dates
      if (isAfter(checkDate, today)) break;
      
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const hasSession = sessions.some(s => s.date === dateStr);
      
      if (hasSession) {
        consecutiveDays++;
      } else if (isBefore(checkDate, today)) {
        // Missed a day in the past
        failed = true;
        break;
      }
    }

    const completed = consecutiveDays >= challenge.target_days;
    
    return {
      progressDays: consecutiveDays,
      failed,
      completed,
      percentage: Math.round((consecutiveDays / challenge.target_days) * 100),
    };
  }, []);

  return {
    challenges,
    activeChallenge,
    loading,
    createChallenge,
    updateChallengeProgress,
    abandonChallenge,
    calculateProgress,
    refetch: fetchChallenges,
  };
};
