import { MeditationSession } from '@/types/meditation';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, parseISO } from 'date-fns';

// Level definitions
export const LEVELS = [
  { level: 1, name: 'Iniciante', minMinutes: 0, maxMinutes: 49 },
  { level: 2, name: 'Constante', minMinutes: 50, maxMinutes: 199 },
  { level: 3, name: 'Focado', minMinutes: 200, maxMinutes: 499 },
  { level: 4, name: 'Zen', minMinutes: 500, maxMinutes: 999 },
  { level: 5, name: 'Mestre Zen', minMinutes: 1000, maxMinutes: Infinity },
];

export const getCurrentLevel = (totalMinutes: number) => {
  return LEVELS.find(l => totalMinutes >= l.minMinutes && totalMinutes <= l.maxMinutes) || LEVELS[0];
};

export const getNextLevel = (currentLevel: number) => {
  return LEVELS.find(l => l.level === currentLevel + 1);
};

export const getLevelProgress = (totalMinutes: number) => {
  const current = getCurrentLevel(totalMinutes);
  const next = getNextLevel(current.level);
  
  if (!next) {
    return { percent: 100, remaining: 0 };
  }
  
  const progressInLevel = totalMinutes - current.minMinutes;
  const levelRange = next.minMinutes - current.minMinutes;
  const percent = Math.min((progressInLevel / levelRange) * 100, 100);
  const remaining = next.minMinutes - totalMinutes;
  
  return { percent, remaining };
};

// Calculate max streak ever achieved
export const calculateMaxStreak = (sessions: MeditationSession[]): number => {
  if (sessions.length === 0) return 0;
  
  const uniqueDates = [...new Set(sessions.map(s => s.date))].sort();
  if (uniqueDates.length === 0) return 0;
  
  let maxStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = parseISO(uniqueDates[i - 1]);
    const currDate = parseISO(uniqueDates[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
};

// Check if user has sessions on all 7 days of current week
export const hasCompleteWeek = (sessions: MeditationSession[]): boolean => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const sessionDates = new Set(sessions.map(s => s.date));
  
  return days.every(day => sessionDates.has(format(day, 'yyyy-MM-dd')));
};

// Badge definitions
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockDescription: string;
  isUnlocked: (sessions: MeditationSession[], totalMinutes: number, maxStreak: number) => boolean;
  getProgress: (sessions: MeditationSession[], totalMinutes: number, maxStreak: number) => { current: number; target: number } | null;
  priority: number; // Lower = shows first
}

export const BADGES: Badge[] = [
  {
    id: 'first_step',
    name: 'Primeiro passo',
    description: 'Você completou sua primeira meditação.',
    icon: '🐣',
    unlockDescription: 'Complete 1 meditação',
    isUnlocked: (sessions) => sessions.length >= 1,
    getProgress: (sessions) => ({ current: Math.min(sessions.length, 1), target: 1 }),
    priority: 1,
  },
  {
    id: 'five_sessions',
    name: '5 sessões',
    description: 'Você completou 5 meditações.',
    icon: '🌱',
    unlockDescription: 'Complete 5 meditações',
    isUnlocked: (sessions) => sessions.length >= 5,
    getProgress: (sessions) => ({ current: Math.min(sessions.length, 5), target: 5 }),
    priority: 2,
  },
  {
    id: 'ten_sessions',
    name: '10 sessões',
    description: 'Você completou 10 meditações.',
    icon: '🌳',
    unlockDescription: 'Complete 10 meditações',
    isUnlocked: (sessions) => sessions.length >= 10,
    getProgress: (sessions) => ({ current: Math.min(sessions.length, 10), target: 10 }),
    priority: 3,
  },
  {
    id: 'streak_3',
    name: 'Foguinho 3 dias',
    description: 'Você meditou 3 dias seguidos.',
    icon: '🔥',
    unlockDescription: 'Medite 3 dias seguidos',
    isUnlocked: (_, __, maxStreak) => maxStreak >= 3,
    getProgress: (_, __, maxStreak) => ({ current: Math.min(maxStreak, 3), target: 3 }),
    priority: 4,
  },
  {
    id: 'streak_7',
    name: 'Foguinho 7 dias',
    description: 'Você meditou 7 dias seguidos.',
    icon: '🔥🔥',
    unlockDescription: 'Medite 7 dias seguidos',
    isUnlocked: (_, __, maxStreak) => maxStreak >= 7,
    getProgress: (_, __, maxStreak) => ({ current: Math.min(maxStreak, 7), target: 7 }),
    priority: 5,
  },
  {
    id: 'complete_week',
    name: 'Semana completa',
    description: 'Você meditou todos os dias desta semana.',
    icon: '📅',
    unlockDescription: 'Medite todos os dias da semana',
    isUnlocked: (sessions) => hasCompleteWeek(sessions),
    getProgress: () => null, // Complex to calculate days this week
    priority: 6,
  },
  {
    id: 'one_hour',
    name: '1 hora de silêncio',
    description: 'Você acumulou 1 hora de meditação.',
    icon: '🌙',
    unlockDescription: 'Medite 60 minutos no total',
    isUnlocked: (_, totalMinutes) => totalMinutes >= 60,
    getProgress: (_, totalMinutes) => ({ current: Math.min(totalMinutes, 60), target: 60 }),
    priority: 7,
  },
  {
    id: 'five_hours',
    name: '5 horas de silêncio',
    description: 'Você acumulou 5 horas de meditação.',
    icon: '✨',
    unlockDescription: 'Medite 300 minutos no total',
    isUnlocked: (_, totalMinutes) => totalMinutes >= 300,
    getProgress: (_, totalMinutes) => ({ current: Math.min(totalMinutes, 300), target: 300 }),
    priority: 8,
  },
];
