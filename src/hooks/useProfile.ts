import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id, display_name: null })
          .select()
          .single();

        if (!insertError) {
          setProfile(newProfile);
        }
      } else if (!error) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (displayName: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName || null })
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, display_name: displayName || null } : null);
    }

    return { error };
  }, [user]);

  const exportDataAsJSON = useCallback(async () => {
    if (!user) return null;

    const { data: sessions } = await supabase
      .from('meditation_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false });

    const { data: freezes } = await supabase
      .from('streak_freezes')
      .select('*')
      .eq('user_id', user.id)
      .order('freeze_date', { ascending: false });

    const exportData = {
      profile: {
        display_name: profile?.display_name,
        email: user.email,
      },
      sessions: sessions || [],
      streak_freezes: freezes || [],
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenfy-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return exportData;
  }, [user, profile]);

  const exportDataAsCSV = useCallback(async () => {
    if (!user) return null;

    const { data: sessions } = await supabase
      .from('meditation_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false });

    if (!sessions || sessions.length === 0) return null;

    const headers = ['date', 'duration_seconds', 'duration_minutes', 'started_at', 'ended_at'];
    const csvRows = [
      headers.join(','),
      ...sessions.map(s => [
        s.date,
        s.duration_seconds,
        Math.round(s.duration_seconds / 60),
        s.started_at,
        s.ended_at,
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenfy-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    return sessions;
  }, [user]);

  const deleteAccount = useCallback(async () => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Delete user data first (cascade should handle most, but let's be explicit)
      await supabase.from('meditation_sessions').delete().eq('user_id', user.id);
      await supabase.from('streak_freezes').delete().eq('user_id', user.id);
      await supabase.from('user_challenges').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);

      // Sign out the user (the actual auth.users deletion would need a server-side function)
      const { error } = await supabase.auth.signOut();
      
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }, [user]);

  return {
    profile,
    isLoading,
    updateProfile,
    exportDataAsJSON,
    exportDataAsCSV,
    deleteAccount,
    refetch: fetchProfile,
  };
};
