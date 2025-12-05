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
import { Flame, Clock, Calendar, Hash, Trophy, Check } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
      bg: 'bg-white', 
      icon: 'text-purple-500', 
      animate: 'animate-pulse', 
      cardGradient: 'bg-gradient-to-br from-purple-500 via-purple-400 to-violet-500',
      textColor: 'text-white',
      subtitleColor: 'text-white/80',
      checkBg: 'bg-purple-300',
      checkIcon: 'text-purple-700'
    };
  } else if (streak >= 7) {
    // Gold gradient for 7-29 days
    return { 
      bg: 'bg-white', 
      icon: 'text-yellow-500', 
      animate: 'animate-pulse', 
      cardGradient: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-400',
      textColor: 'text-white',
      subtitleColor: 'text-white/80',
      checkBg: 'bg-amber-200',
      checkIcon: 'text-amber-700'
    };
  } else if (streak >= 1) {
    // Orange gradient for 1-6 days
    return { 
      bg: 'bg-white', 
      icon: 'text-orange-500', 
      animate: streak >= 2 ? 'animate-pulse' : '', 
      cardGradient: 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-500',
      textColor: 'text-white',
      subtitleColor: 'text-white/80',
      checkBg: 'bg-orange-200',
      checkIcon: 'text-orange-700'
    };
  }
  // No streak - neutral style
  return { 
    bg: 'bg-muted', 
    icon: 'text-muted-foreground', 
    animate: '', 
    cardGradient: '',
    textColor: 'text-foreground',
    subtitleColor: 'text-muted-foreground',
    checkBg: 'bg-muted',
    checkIcon: 'text-muted-foreground'
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

  // Get current week days for the weekday display
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Start on Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    const hasSession = sessions.some(s => isSameDay(new Date(s.date), day));
    const isToday = isSameDay(day, today);
    const isFuture = day > today;
    return {
      label: format(day, 'EEE', { locale: ptBR }).slice(0, 3),
      date: day,
      hasSession,
      isToday,
      isFuture
    };
  });

  return (
    <div className="min-h-[70vh] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-light text-center text-foreground mb-8">Progresso</h2>
        
        {/* Streak Card */}
        <Card className={`p-6 overflow-hidden ${flameStyles.cardGradient}`}>
          <div className="flex flex-col gap-4">
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
            
            {/* Weekday Icons */}
            <div className="flex justify-around items-center mt-3 bg-white/10 rounded-2xl py-4 px-2">
              {weekDays.map((day, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      day.hasSession 
                        ? `${flameStyles.checkBg}` 
                        : day.isToday 
                          ? 'bg-white/30 ring-2 ring-white/60' 
                          : 'bg-white/15 border border-white/20'
                    }`}
                  >
                    {day.hasSession ? (
                      <Check className={`w-5 h-5 ${flameStyles.checkIcon}`} strokeWidth={2.5} />
                    ) : day.isToday ? (
                      <Flame className={`w-5 h-5 ${streak > 0 ? flameStyles.textColor : 'text-white/50'}`} />
                    ) : null}
                  </div>
                  <span className={`text-[11px] capitalize ${day.isToday ? flameStyles.textColor + ' font-bold' : flameStyles.subtitleColor}`}>
                    {day.label}
                  </span>
                </div>
              ))}
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
