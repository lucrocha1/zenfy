import { useState, useEffect, useCallback, useMemo } from 'react';
import { MeditationSession } from '@/types/meditation';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const DEVICE_ID_KEY = 'meditation_device_id';
const LEGACY_STORAGE_KEY = 'meditation_sessions';

const getOrCreateDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

// Create a Supabase client with device_id header for RLS validation
const createDeviceClient = (deviceId: string) => {
  return createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      global: {
        headers: {
          'x-device-id': deviceId,
        },
      },
    }
  );
};

export const useMeditationSessions = () => {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const deviceId = getOrCreateDeviceId();
  
  // Memoize the client to avoid recreating on each render
  const supabaseClient = useMemo(() => createDeviceClient(deviceId), [deviceId]);

  // Fetch sessions from database
  const fetchSessions = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from('meditation_sessions')
      .select('*')
      .eq('device_id', deviceId)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
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
  }, [supabaseClient, deviceId]);

  // Migrate legacy localStorage data to cloud
  const migrateLegacyData = useCallback(async () => {
    const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyData) return;

    try {
      const legacySessions: MeditationSession[] = JSON.parse(legacyData);
      if (legacySessions.length === 0) return;

      // Insert legacy sessions to cloud
      const sessionsToInsert = legacySessions.map(s => ({
        device_id: deviceId,
        started_at: s.started_at,
        ended_at: s.ended_at,
        duration_seconds: s.duration_seconds,
        date: s.date,
      }));

      const { error } = await supabaseClient
        .from('meditation_sessions')
        .insert(sessionsToInsert);

      if (!error) {
        // Remove legacy data after successful migration
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        console.log('Migrated', legacySessions.length, 'sessions to cloud');
      }
    } catch (e) {
      console.error('Error migrating legacy data:', e);
    }
  }, [supabaseClient, deviceId]);

  useEffect(() => {
    const init = async () => {
      await migrateLegacyData();
      await fetchSessions();
    };
    init();
  }, [migrateLegacyData, fetchSessions]);

  const saveSession = useCallback(async (session: Omit<MeditationSession, 'id'>) => {
    const { data, error } = await supabaseClient
      .from('meditation_sessions')
      .insert({
        device_id: deviceId,
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
  }, [supabaseClient, deviceId]);

  return { sessions, saveSession, isLoading };
};
