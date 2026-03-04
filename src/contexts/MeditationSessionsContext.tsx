import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { MeditationSession } from '@/types/meditation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MeditationSessionsContextType {
  sessions: MeditationSession[];
  saveSession: (session: Omit<MeditationSession, 'id'>) => Promise<void>;
  deleteSession: (id: string) => Promise<boolean>;
  isLoading: boolean;
  refreshSessions: () => Promise<void>;
}

export const MeditationSessionsContext = createContext<MeditationSessionsContextType>({
  sessions: [],
  saveSession: async () => {},
  deleteSession: async () => false,
  isLoading: true,
  refreshSessions: async () => {},
});

export const MeditationSessionsProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

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
        device_id: user.id,
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

  const deleteSession = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase
      .from('meditation_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting session:', error);
      return false;
    }

    setSessions(prev => prev.filter(s => s.id !== id));
    return true;
  }, [user]);

  return (
    <MeditationSessionsContext.Provider value={{ sessions, saveSession, deleteSession, isLoading, refreshSessions: fetchSessions }}>
      {children}
    </MeditationSessionsContext.Provider>
  );
};
