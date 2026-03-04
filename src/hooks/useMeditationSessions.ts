import { useContext } from 'react';
import { MeditationSessionsContext } from '@/contexts/MeditationSessionsContext';

export const useMeditationSessions = () => useContext(MeditationSessionsContext);
