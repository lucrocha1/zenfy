import { useState, useEffect, useCallback } from 'react';
import { MeditationSession } from '@/types/meditation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useMeditationSessions = () => {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch sessions from database
  const fetchSessions = useCallback(async () => {
    if (!user) {
      setSessions([]);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('meditation_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      setIsLoading(false);
      return;
    }

    const formattedSessions: MeditationSession[] = (data || []).map(s => ({
      id: s.id,
      started_at: s.started_at,
      ended_at: s.ended_at,
      duration_seconds: s.duration_seconds,
      date: s.date,
    }));

    setSessions(formattedSessions);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const saveSession = useCallback(async (session: Omit<MeditationSession, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('meditation_sessions')
      .insert({
        user_id: user.id,
        device_id: user.id, // Keep for backwards compatibility
        started_at: session.started_at,
        ended_at: session.ended_at,
        duration_seconds: session.duration_seconds,
        date: session.date,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving session:', error);
      return;
    }

    if (data) {
      const newSession: MeditationSession = {
        id: data.id,
        started_at: data.started_at,
        ended_at: data.ended_at,
        duration_seconds: data.duration_seconds,
        date: data.date,
      };
      setSessions(prev => [newSession, ...prev]);
    }
  }, [user]);

  return { sessions, saveSession, isLoading };
};
