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
export const calculateMaxStreak = (sessions: MeditationSession[], freezeDates: string[] = []): number => {
  if (sessions.length === 0 && freezeDates.length === 0) return 0;
  
  const sessionDates = new Set(sessions.map(s => s.date));
  const allActiveDates = new Set([...sessionDates, ...freezeDates]);
  const uniqueDates = [...allActiveDates].sort();
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

// Helper to check if user has sessions at specific hour range
const getSessionsAtTimeRange = (sessions: MeditationSession[], startHour: number, endHour: number): number => {
  return sessions.filter(s => {
    const hour = new Date(s.started_at).getHours();
    return hour >= startHour && hour < endHour;
  }).length;
};

// Helper to get longest single session in minutes
const getLongestSession = (sessions: MeditationSession[]): number => {
  if (sessions.length === 0) return 0;
  return Math.max(...sessions.map(s => s.duration_seconds / 60));
};

export const BADGES: Badge[] = [
  // ===== SESSION COUNT BADGES =====
  {
    id: 'first_step',
    name: 'Primeiro passo',
    description: 'Você completou sua primeira sessão.',
    icon: '🐣',
    unlockDescription: 'Complete 1 sessão',
    isUnlocked: (sessions) => sessions.length >= 1,
    getProgress: (sessions) => ({ current: Math.min(sessions.length, 1), target: 1 }),
    priority: 1,
  },
  {
    id: 'five_sessions',
    name: '5 sessões',
    description: 'Você completou 5 sessões.',
    icon: '🌱',
    unlockDescription: 'Complete 5 sessões',
    isUnlocked: (sessions) => sessions.length >= 5,
    getProgress: (sessions) => ({ current: Math.min(sessions.length, 5), target: 5 }),
    priority: 2,
  },
  {
    id: 'ten_sessions',
    name: '10 sessões',
    description: 'Você completou 10 sessões.',
    icon: '🌳',
    unlockDescription: 'Complete 10 sessões',
    isUnlocked: (sessions) => sessions.length >= 10,
    getProgress: (sessions) => ({ current: Math.min(sessions.length, 10), target: 10 }),
    priority: 3,
  },
  {
    id: 'twentyfive_sessions',
    name: '25 sessões',
    description: 'Você completou 25 sessões.',
    icon: '🌿',
    unlockDescription: 'Complete 25 sessões',
    isUnlocked: (sessions) => sessions.length >= 25,
    getProgress: (sessions) => ({ current: Math.min(sessions.length, 25), target: 25 }),
    priority: 4,
  },
  {
    id: 'fifty_sessions',
    name: '50 sessões',
    description: 'Você completou 50 sessões.',
    icon: '🌲',
    unlockDescription: 'Complete 50 sessões',
    isUnlocked: (sessions) => sessions.length >= 50,
    getProgress: (sessions) => ({ current: Math.min(sessions.length, 50), target: 50 }),
    priority: 5,
  },
  {
    id: 'hundred_sessions',
    name: '100 sessões',
    description: 'Você completou 100 sessões.',
    icon: '🏔️',
    unlockDescription: 'Complete 100 sessões',
    isUnlocked: (sessions) => sessions.length >= 100,
    getProgress: (sessions) => ({ current: Math.min(sessions.length, 100), target: 100 }),
    priority: 6,
  },
  {
    id: 'fivehundred_sessions',
    name: '500 sessões',
    description: 'Você completou 500 sessões.',
    icon: '⛰️',
    unlockDescription: 'Complete 500 sessões',
    isUnlocked: (sessions) => sessions.length >= 500,
    getProgress: (sessions) => ({ current: Math.min(sessions.length, 500), target: 500 }),
    priority: 7,
  },
  {
    id: 'thousand_sessions',
    name: 'Mestre da Consistência',
    description: 'Você completou 1000 sessões!',
    icon: '🗻',
    unlockDescription: 'Complete 1000 sessões',
    isUnlocked: (sessions) => sessions.length >= 1000,
    getProgress: (sessions) => ({ current: Math.min(sessions.length, 1000), target: 1000 }),
    priority: 8,
  },
  
  // ===== STREAK BADGES =====
  {
    id: 'streak_3',
    name: 'Foguinho 3 dias',
    description: 'Você meditou 3 dias seguidos.',
    icon: '🔥',
    unlockDescription: 'Medite 3 dias seguidos',
    isUnlocked: (_, __, maxStreak) => maxStreak >= 3,
    getProgress: (_, __, maxStreak) => ({ current: Math.min(maxStreak, 3), target: 3 }),
    priority: 10,
  },
  {
    id: 'streak_7',
    name: 'Foguinho 7 dias',
    description: 'Você meditou 7 dias seguidos.',
    icon: '🔥🔥',
    unlockDescription: 'Medite 7 dias seguidos',
    isUnlocked: (_, __, maxStreak) => maxStreak >= 7,
    getProgress: (_, __, maxStreak) => ({ current: Math.min(maxStreak, 7), target: 7 }),
    priority: 11,
  },
  {
    id: 'streak_14',
    name: 'Duas semanas',
    description: 'Você meditou 14 dias seguidos.',
    icon: '🔥🔥🔥',
    unlockDescription: 'Medite 14 dias seguidos',
    isUnlocked: (_, __, maxStreak) => maxStreak >= 14,
    getProgress: (_, __, maxStreak) => ({ current: Math.min(maxStreak, 14), target: 14 }),
    priority: 12,
  },
  {
    id: 'streak_30',
    name: 'Um mês inteiro',
    description: 'Você meditou 30 dias seguidos!',
    icon: '💎',
    unlockDescription: 'Medite 30 dias seguidos',
    isUnlocked: (_, __, maxStreak) => maxStreak >= 30,
    getProgress: (_, __, maxStreak) => ({ current: Math.min(maxStreak, 30), target: 30 }),
    priority: 13,
  },
  {
    id: 'streak_60',
    name: 'Dois meses',
    description: 'Você meditou 60 dias seguidos!',
    icon: '👑',
    unlockDescription: 'Medite 60 dias seguidos',
    isUnlocked: (_, __, maxStreak) => maxStreak >= 60,
    getProgress: (_, __, maxStreak) => ({ current: Math.min(maxStreak, 60), target: 60 }),
    priority: 14,
  },
  {
    id: 'streak_100',
    name: 'Centenário',
    description: 'Você meditou 100 dias seguidos!',
    icon: '🏆',
    unlockDescription: 'Medite 100 dias seguidos',
    isUnlocked: (_, __, maxStreak) => maxStreak >= 100,
    getProgress: (_, __, maxStreak) => ({ current: Math.min(maxStreak, 100), target: 100 }),
    priority: 15,
  },
  {
    id: 'streak_365',
    name: 'Um ano completo',
    description: 'Você meditou 365 dias seguidos!',
    icon: '⭐',
    unlockDescription: 'Medite 365 dias seguidos',
    isUnlocked: (_, __, maxStreak) => maxStreak >= 365,
    getProgress: (_, __, maxStreak) => ({ current: Math.min(maxStreak, 365), target: 365 }),
    priority: 16,
  },
  
  // ===== WEEK BADGE =====
  {
    id: 'complete_week',
    name: 'Semana completa',
    description: 'Você meditou todos os dias desta semana.',
    icon: '📅',
    unlockDescription: 'Medite todos os dias da semana',
    isUnlocked: (sessions) => hasCompleteWeek(sessions),
    getProgress: () => null,
    priority: 20,
  },
  
  // ===== TIME BADGES =====
  {
    id: 'one_hour',
    name: '1 hora de silêncio',
    description: 'Você acumulou 1 hora de meditação.',
    icon: '🌙',
    unlockDescription: 'Medite 60 min no total',
    isUnlocked: (_, totalMinutes) => totalMinutes >= 60,
    getProgress: (_, totalMinutes) => ({ current: Math.min(totalMinutes, 60), target: 60 }),
    priority: 30,
  },
  {
    id: 'five_hours',
    name: '5 horas de silêncio',
    description: 'Você acumulou 5 horas de meditação.',
    icon: '✨',
    unlockDescription: 'Medite 300 min no total',
    isUnlocked: (_, totalMinutes) => totalMinutes >= 300,
    getProgress: (_, totalMinutes) => ({ current: Math.min(totalMinutes, 300), target: 300 }),
    priority: 31,
  },
  {
    id: 'ten_hours',
    name: '10 horas de silêncio',
    description: 'Você acumulou 10 horas de meditação.',
    icon: '🎯',
    unlockDescription: 'Medite 600 min no total',
    isUnlocked: (_, totalMinutes) => totalMinutes >= 600,
    getProgress: (_, totalMinutes) => ({ current: Math.min(totalMinutes, 600), target: 600 }),
    priority: 32,
  },
  {
    id: 'twentyfour_hours',
    name: 'Um dia inteiro',
    description: 'Você acumulou 24 horas de meditação!',
    icon: '🌟',
    unlockDescription: 'Medite 1440 min no total',
    isUnlocked: (_, totalMinutes) => totalMinutes >= 1440,
    getProgress: (_, totalMinutes) => ({ current: Math.min(totalMinutes, 1440), target: 1440 }),
    priority: 33,
  },
  {
    id: 'fifty_hours',
    name: '50 horas de silêncio',
    description: 'Você acumulou 50 horas de meditação!',
    icon: '💫',
    unlockDescription: 'Medite 3000 min no total',
    isUnlocked: (_, totalMinutes) => totalMinutes >= 3000,
    getProgress: (_, totalMinutes) => ({ current: Math.min(totalMinutes, 3000), target: 3000 }),
    priority: 34,
  },
  {
    id: 'hundred_hours',
    name: 'Centena de horas',
    description: 'Você acumulou 100 horas de meditação!',
    icon: '🌈',
    unlockDescription: 'Medite 6000 min no total',
    isUnlocked: (_, totalMinutes) => totalMinutes >= 6000,
    getProgress: (_, totalMinutes) => ({ current: Math.min(totalMinutes, 6000), target: 6000 }),
    priority: 35,
  },
  
  // ===== SPECIAL BADGES =====
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Você completou 10 sessões antes das 7h.',
    icon: '🌅',
    unlockDescription: '10 sessões antes das 7h',
    isUnlocked: (sessions) => getSessionsAtTimeRange(sessions, 0, 7) >= 10,
    getProgress: (sessions) => ({ current: Math.min(getSessionsAtTimeRange(sessions, 0, 7), 10), target: 10 }),
    priority: 40,
  },
  {
    id: 'night_owl',
    name: 'Coruja noturna',
    description: 'Você completou 10 sessões após 22h.',
    icon: '🦉',
    unlockDescription: '10 sessões após 22h',
    isUnlocked: (sessions) => getSessionsAtTimeRange(sessions, 22, 24) >= 10,
    getProgress: (sessions) => ({ current: Math.min(getSessionsAtTimeRange(sessions, 22, 24), 10), target: 10 }),
    priority: 41,
  },
  {
    id: 'long_session',
    name: 'Sessão longa',
    description: 'Você completou uma sessão de 30+ minutos.',
    icon: '🧘',
    unlockDescription: 'Complete uma sessão de 30+ min',
    isUnlocked: (sessions) => getLongestSession(sessions) >= 30,
    getProgress: (sessions) => ({ current: Math.min(Math.floor(getLongestSession(sessions)), 30), target: 30 }),
    priority: 42,
  },
  {
    id: 'marathon',
    name: 'Maratonista',
    description: 'Você completou uma sessão de 60+ minutos!',
    icon: '🏃',
    unlockDescription: 'Complete uma sessão de 60+ min',
    isUnlocked: (sessions) => getLongestSession(sessions) >= 60,
    getProgress: (sessions) => ({ current: Math.min(Math.floor(getLongestSession(sessions)), 60), target: 60 }),
    priority: 43,
  },
];
