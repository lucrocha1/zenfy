import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMeditationSessions } from '@/hooks/useMeditationSessions';
import {
  formatDuration,
  getWeeklySessions,
  getMonthlySessions,
  getTotalDuration,
  calculateStreak,
  getWeeklyChartData,
  getMonthlyChartData,
  getYearlyChartData,
  getTodaySessions,
  getDailyGoal,
  saveDailyGoal,
  analyzeBestTimeToMeditate,
} from '@/utils/meditationStats';
import { calculateMaxStreak } from '@/utils/gamification';
import { Flame, Clock, Calendar, Hash, Trophy, Check, Target, Settings, TrendingUp, Snowflake } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StreakFreezeCard } from './StreakFreezeCard';

const getChartColors = (streak: number) => {
  if (streak >= 30) {
    return { stroke: '#a855f7', gradient: ['#a855f7', '#7c3aed'] }; // Purple
  } else if (streak >= 7) {
    return { stroke: '#eab308', gradient: ['#eab308', '#f59e0b'] }; // Gold
  }
  return { stroke: '#2dd4bf', gradient: ['#2dd4bf', '#5eead4'] }; // Teal default (matches primary hsl(172, 66%, 50%))
};

const getProgressBarColor = (progress: number, streak: number, goalReached: boolean) => {
  // If goal reached, use streak colors
  if (goalReached) {
    if (streak >= 30) return 'bg-gradient-to-r from-purple-500 to-violet-500';
    if (streak >= 7) return 'bg-gradient-to-r from-amber-400 to-orange-400';
    if (streak >= 1) return 'bg-gradient-to-r from-orange-400 to-red-500';
    return 'bg-primary';
  }
  
  // Progressive primary intensity based on percentage
  if (progress >= 75) return 'bg-primary';
  if (progress >= 50) return 'bg-primary/80';
  if (progress >= 25) return 'bg-primary/60';
  return 'bg-primary/40';
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
  const [dailyGoal, setDailyGoal] = useState(getDailyGoal());
  const [tempGoal, setTempGoal] = useState(dailyGoal);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('week');
  
  const streak = calculateStreak(sessions);
  const maxStreak = calculateMaxStreak(sessions);
  const weeklySessions = getWeeklySessions(sessions);
  const monthlySessions = getMonthlySessions(sessions);
  const weeklyDuration = getTotalDuration(weeklySessions);
  const monthlyDuration = getTotalDuration(monthlySessions);
  const totalDuration = getTotalDuration(sessions);
  const todaySessions = getTodaySessions(sessions);
  const todayMinutes = Math.round(getTotalDuration(todaySessions) / 60);
  const goalProgress = Math.min((todayMinutes / dailyGoal) * 100, 100);
  
  const weeklyChartData = getWeeklyChartData(sessions);
  const monthlyChartData = getMonthlyChartData(sessions);
  const yearlyChartData = getYearlyChartData(sessions);
  
  const chartData = chartPeriod === 'week' 
    ? weeklyChartData 
    : chartPeriod === 'month' 
      ? monthlyChartData 
      : yearlyChartData;
  
  const flameStyles = getFlameStyles(streak);
  const chartColors = getChartColors(streak);
  
  const { analysis: timeAnalysis, bestPeriod } = analyzeBestTimeToMeditate(sessions);
  
  const hasAnyData = totalDuration > 0 || sessions.length > 0;
  const hasChartData = chartData.some(d => d.minutes > 0);
  
  const handleSaveGoal = () => {
    saveDailyGoal(tempGoal);
    setDailyGoal(tempGoal);
    setIsGoalDialogOpen(false);
  };
  const streakSubtitle = getStreakSubtitle(streak, sessions);

  // Get current week days for the weekday display
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Start on Sunday
  
  // Check if user has ever meditated (to show ice flames for missed days)
  const hasEverMeditated = sessions.length > 0;
  const firstSessionDate = hasEverMeditated 
    ? new Date(Math.min(...sessions.map(s => new Date(s.date).getTime())))
    : null;
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    const hasSession = sessions.some(s => isSameDay(new Date(s.date), day));
    const isToday = isSameDay(day, today);
    const isFuture = day > today;
    const isPast = day < today && !isToday;
    // Missed day: past day, no session, and user has started meditating before or on this day
    const isMissed = isPast && !hasSession && hasEverMeditated && firstSessionDate && day >= firstSessionDate;
    return {
      label: format(day, 'EEE', { locale: ptBR }).slice(0, 3),
      date: day,
      hasSession,
      isToday,
      isFuture,
      isMissed
    };
  });

  return (
    <div className="min-h-[70vh] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-light text-center text-foreground mb-8">Progresso</h2>
        
        {/* Daily Goal Card */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">Meta Diária</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setTempGoal(dailyGoal);
                setIsGoalDialogOpen(true);
              }}
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          <div className="space-y-3">
            <Progress 
              value={goalProgress} 
              className="h-3" 
              indicatorClassName={getProgressBarColor(goalProgress, streak, todayMinutes >= dailyGoal)}
            />
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-foreground">
                {todayMinutes} de {dailyGoal} min
              </span>
              {todayMinutes >= dailyGoal ? (
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Meta atingida! 🎉
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Faltam {dailyGoal - todayMinutes} min
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Daily Goal Dialog */}
        <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Definir Meta Diária</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="text-center">
                <span className="text-4xl font-bold text-primary">{tempGoal}</span>
                <span className="text-lg text-muted-foreground ml-2">minutos</span>
              </div>
              <Slider
                value={[tempGoal]}
                onValueChange={(value) => setTempGoal(value[0])}
                min={1}
                max={120}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 min</span>
                <span>120 min</span>
              </div>
              <Button onClick={handleSaveGoal} className="w-full">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
            
            {/* Weekday Icons with connecting lines between circles */}
            <div className="mt-3 bg-white/10 rounded-xl py-3 px-3 sm:px-4">
              <div className="flex justify-between items-center">
                {weekDays.map((day, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div 
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                          day.hasSession 
                            ? `${flameStyles.checkBg}` 
                            : day.isMissed
                              ? 'bg-sky-400/30 border border-sky-300/50'
                              : day.isToday 
                                ? 'bg-white/30 ring-2 ring-white/60' 
                                : 'bg-white/15 border border-white/20'
                        }`}
                      >
                        {day.hasSession ? (
                          <Check className={`w-4 h-4 sm:w-5 sm:h-5 ${flameStyles.checkIcon}`} strokeWidth={2.5} />
                        ) : day.isMissed ? (
                          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-sky-300" />
                        ) : day.isToday ? (
                          <Flame className={`w-4 h-4 sm:w-5 sm:h-5 ${streak > 0 ? flameStyles.textColor : 'text-white/50'}`} />
                        ) : null}
                      </div>
                      <span className={`text-[10px] sm:text-[11px] capitalize ${
                        day.isToday 
                          ? flameStyles.textColor + ' font-bold' 
                          : day.isMissed 
                            ? 'text-sky-300' 
                            : flameStyles.subtitleColor
                      }`}>
                        {day.label}
                      </span>
                    </div>
                    {/* Line segment between circles */}
                    {index < weekDays.length - 1 && (
                      <div className="flex-1 h-0.5 bg-white/20 mx-1 sm:mx-2 -mt-5" />
                    )}
                  </div>
                ))}
              </div>
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

        {/* Streak Freeze Card */}
        <StreakFreezeCard />

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

        {/* Best Time to Meditate Card */}
        {timeAnalysis.length > 0 && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Quando você medita</h3>
            </div>
            <div className="space-y-3">
              {timeAnalysis.map((item) => (
                <div key={item.period} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="text-foreground">{item.period}</span>
                    </span>
                    <span className="text-muted-foreground">{item.percentage}%</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
              {bestPeriod && (
                <p className="text-sm text-muted-foreground pt-2 border-t border-border mt-3">
                  Você costuma meditar {bestPeriod === 'Manhã' ? 'pela manhã' : 
                    bestPeriod === 'Tarde' ? 'à tarde' : 
                    bestPeriod === 'Noite' ? 'à noite' : 'de madrugada'} ✨
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Chart with Period Tabs */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                {chartPeriod === 'week' ? 'Minutos por dia' : 
                 chartPeriod === 'month' ? 'Minutos por dia (mês)' : 'Minutos por mês'}
              </p>
            </div>
            <Tabs value={chartPeriod} onValueChange={(v) => setChartPeriod(v as any)}>
              <TabsList className="h-8">
                <TabsTrigger value="week" className="text-xs px-3 h-7">Semana</TabsTrigger>
                <TabsTrigger value="month" className="text-xs px-3 h-7">Mês</TabsTrigger>
                <TabsTrigger value="year" className="text-xs px-3 h-7">Ano</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="h-48">
            {hasChartData ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartPeriod === 'week' ? (
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
                ) : (
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: chartPeriod === 'month' ? 10 : 12 }}
                      interval={chartPeriod === 'month' ? 4 : 0}
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
                    <Bar
                      dataKey="minutes"
                      fill={chartColors.stroke}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">
                  {chartPeriod === 'week' ? 'Nenhuma sessão nesta semana' :
                   chartPeriod === 'month' ? 'Nenhuma sessão este mês' : 'Nenhuma sessão este ano'}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
