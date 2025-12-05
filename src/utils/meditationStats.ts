import { MeditationSession } from '@/types/meditation';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  parseISO,
  format,
  eachDayOfInterval,
  subDays,
  isSameDay
} from 'date-fns';

const DAILY_GOAL_KEY = 'meditation_daily_goal';

export const getDailyGoal = (): number => {
  const saved = localStorage.getItem(DAILY_GOAL_KEY);
  return saved ? parseInt(saved) : 10; // Default 10 minutes
};

export const saveDailyGoal = (minutes: number) => {
  localStorage.setItem(DAILY_GOAL_KEY, String(minutes));
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getWeeklySessions = (sessions: MeditationSession[]): MeditationSession[] => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  return sessions.filter(session => {
    const sessionDate = parseISO(session.date);
    return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
  });
};

export const getMonthlySessions = (sessions: MeditationSession[]): MeditationSession[] => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  return sessions.filter(session => {
    const sessionDate = parseISO(session.date);
    return isWithinInterval(sessionDate, { start: monthStart, end: monthEnd });
  });
};

export const getTotalDuration = (sessions: MeditationSession[]): number => {
  return sessions.reduce((total, session) => total + session.duration_seconds, 0);
};

export const getTodaySessions = (sessions: MeditationSession[]): MeditationSession[] => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return sessions.filter(s => s.date === today);
};

export const calculateStreak = (sessions: MeditationSession[]): number => {
  if (sessions.length === 0) return 0;
  
  const uniqueDates = [...new Set(sessions.map(s => s.date))].sort().reverse();
  if (uniqueDates.length === 0) return 0;
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  
  // Check if the most recent session is today or yesterday
  const mostRecentDate = uniqueDates[0];
  if (mostRecentDate !== today && mostRecentDate !== yesterday) {
    return 0;
  }
  
  let streak = 0;
  let checkDate = mostRecentDate === today ? new Date() : subDays(new Date(), 1);
  
  for (const dateStr of uniqueDates) {
    const expectedDate = format(checkDate, 'yyyy-MM-dd');
    if (dateStr === expectedDate) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else if (dateStr < expectedDate) {
      break;
    }
  }
  
  return streak;
};

const dayNamesPt = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const getWeeklyChartData = (sessions: MeditationSession[]) => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  return days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const daySessions = sessions.filter(s => s.date === dayStr);
    const totalMinutes = Math.round(getTotalDuration(daySessions) / 60);
    
    return {
      day: dayNamesPt[day.getDay()],
      date: dayStr,
      minutes: totalMinutes,
    };
  });
};
