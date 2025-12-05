import { useState, useEffect, useCallback } from 'react';
import { MeditationSession } from '@/types/meditation';

const STORAGE_KEY = 'meditation_sessions';

export const useMeditationSessions = () => {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSessions(JSON.parse(stored));
    }
  }, []);

  const saveSession = useCallback((session: Omit<MeditationSession, 'id'>) => {
    const newSession: MeditationSession = {
      ...session,
      id: crypto.randomUUID(),
    };
    setSessions(prev => {
      const updated = [...prev, newSession];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { sessions, saveSession };
};
