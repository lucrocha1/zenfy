import { Card } from '@/components/ui/card';
import { useMeditationSessions } from '@/hooks/useMeditationSessions';
import {
  formatDuration,
  getWeeklySessions,
  getMonthlySessions,
  getTotalDuration,
  calculateStreak,
  getWeeklyChartData,
  getTodaySessions,
} from '@/utils/meditationStats';
import { calculateMaxStreak } from '@/utils/gamification';
import { Flame, Clock, Calendar, Hash, Trophy } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { format, subDays } from 'date-fns';

const getChartColors = (streak: number) => {
  if (streak >= 30) {
    return { stroke: '#a855f7', gradient: ['#a855f7', '#7c3aed'] }; // Purple
  } else if (streak >= 7) {
    return { stroke: '#eab308', gradient: ['#eab308', '#f59e0b'] }; // Gold
  }
  return { stroke: '#3b82f6', gradient: ['#3b82f6', '#60a5fa'] }; // Blue default
};

const getFlameStyles = (streak: number) => {
  if (streak >= 30) {
    // Purple gradient for 30+ days
    return { 
      bg: 'bg-white/20', 
      icon: 'text-white drop-shadow-lg', 
      animate: 'animate-pulse', 
      cardGradient: 'bg-gradient-to-br from-purple-500 via-purple-400 to-violet-500',
      textColor: 'text-white',
      subtitleColor: 'text-white/80'
    };
  } else if (streak >= 7) {
    // Gold gradient for 7-29 days
    return { 
      bg: 'bg-white/20', 
      icon: 'text-white drop-shadow-lg', 
      animate: 'animate-pulse', 
      cardGradient: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-400',
      textColor: 'text-white',
      subtitleColor: 'text-white/80'
    };
  } else if (streak >= 1) {
    // Orange gradient for 1-6 days
    return { 
      bg: 'bg-white/20', 
      icon: 'text-white drop-shadow-lg', 
      animate: streak >= 2 ? 'animate-pulse' : '', 
      cardGradient: 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-500',
      textColor: 'text-white',
      subtitleColor: 'text-white/80'
    };
  }
  // No streak - neutral style
  return { 
    bg: 'bg-muted', 
    icon: 'text-muted-foreground', 
    animate: '', 
    cardGradient: '',
    textColor: 'text-foreground',
    subtitleColor: 'text-muted-foreground'
  };
};

const getStreakSubtitle = (streak: number, sessions: any[]) => {
  if (streak === 0) return null;
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const todaySessions = sessions.filter(s => s.date === today);
  const yesterdaySessions = sessions.filter(s => s.date === yesterday);
  
  if (todaySessions.length > 0) {
    return streak >= 2 ? "Continue assim! 🔥" : "Você meditou hoje 👏";
  } else if (yesterdaySessions.length > 0) {
    return "Medite hoje para manter o fogo aceso 🔥";
  }
  return null;
};

export const Performance = () => {
  const { sessions } = useMeditationSessions();
  
  const streak = calculateStreak(sessions);
  const maxStreak = calculateMaxStreak(sessions);
  const weeklySessions = getWeeklySessions(sessions);
  const monthlySessions = getMonthlySessions(sessions);
  const weeklyDuration = getTotalDuration(weeklySessions);
  const monthlyDuration = getTotalDuration(monthlySessions);
  const totalDuration = getTotalDuration(sessions);
  const chartData = getWeeklyChartData(sessions);
  const flameStyles = getFlameStyles(streak);
  const chartColors = getChartColors(streak);
  
  const hasAnyData = totalDuration > 0 || sessions.length > 0;
  const hasChartData = chartData.some(d => d.minutes > 0);
  const streakSubtitle = getStreakSubtitle(streak, sessions);

  return (
    <div className="min-h-[70vh] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-light text-center text-foreground mb-8">Progresso</h2>
        
        {/* Streak Card */}
        <Card className={`p-6 overflow-hidden ${flameStyles.cardGradient}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${flameStyles.bg}`}>
              <Flame className={`w-6 h-6 ${flameStyles.icon} ${flameStyles.animate}`} />
            </div>
            <div className="flex-1">
              <p className={`text-sm ${flameStyles.subtitleColor}`}>Sequência de dias</p>
              {streak > 0 ? (
                <>
                  <p className={`text-2xl font-semibold ${flameStyles.textColor}`}>
                    {streak} {streak === 1 ? 'dia' : 'dias'} {streak >= 2 && 'seguidos'} {streak >= 2 && '🔥'}
                  </p>
                  {streakSubtitle && (
                    <p className={`text-sm ${flameStyles.subtitleColor} mt-1`}>{streakSubtitle}</p>
                  )}
                </>
              ) : (
                <p className={flameStyles.subtitleColor}>
                  Você ainda não iniciou uma sequência. Que tal começar hoje?
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Best Streak Card */}
        {maxStreak > 1 && (
          <Card className="p-4 bg-muted/30">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <p className="text-sm text-foreground">
                Seu melhor foi <span className="font-semibold">{maxStreak} dias seguidos</span> 🔥
              </p>
            </div>
          </Card>
        )}

        {/* Empty State Message */}
        {!hasAnyData && (
            <p className="text-center text-sm text-muted-foreground py-2">
            Comece hoje para ver seus números aparecerem aqui ✨
          </p>
        )}

        {/* Time Meditated Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Tempo meditado</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Card className="p-4 text-center">
              <p className="text-xl font-semibold text-foreground">
                {formatDuration(weeklyDuration)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Esta semana</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xl font-semibold text-foreground">
                {formatDuration(monthlyDuration)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Este mês</p>
            </Card>
            <Card className="p-4 text-center col-span-2 sm:col-span-1">
              <p className="text-xl font-semibold text-foreground">
                {formatDuration(totalDuration)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total</p>
            </Card>
          </div>
        </div>

        {/* Session Counts Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Quantidade de sessões</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Card className="p-4 text-center">
              <p className="text-2xl font-semibold text-foreground">{weeklySessions.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Esta semana</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-semibold text-foreground">{monthlySessions.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Este mês</p>
            </Card>
            <Card className="p-4 text-center col-span-2 sm:col-span-1">
              <p className="text-2xl font-semibold text-foreground">{sessions.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Total</p>
            </Card>
          </div>
        </div>

        {/* Weekly Chart */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Minutos por dia (semana atual)</p>
          </div>
          <div className="h-48">
            {hasChartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.gradient[0]} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={chartColors.gradient[1]} stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [`${value} min`, 'Meditação']}
                  />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke={chartColors.stroke}
                    strokeWidth={2}
                    fill="url(#chartGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">
                  Nenhuma sessão registrada nesta semana ainda
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
