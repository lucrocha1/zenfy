import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useMeditationSessions } from '@/hooks/useMeditationSessions';
import {
  formatDuration,
  getWeeklySessions,
  getMonthlySessions,
  getTotalDuration,
  calculateStreak,
  getWeeklyChartData,
  getDailyGoal,
  saveDailyGoal,
} from '@/utils/meditationStats';
import { Flame, Calendar, Clock, Target, Check, Pencil } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { format } from 'date-fns';

const getFlameStyles = (streak: number) => {
  if (streak >= 30) {
    // Purple for 1+ month
    return { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-500', glow: 'shadow-purple-300/50 shadow-lg', animate: 'animate-pulse' };
  } else if (streak >= 7) {
    // Gold for 1+ week
    return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-500', glow: 'shadow-yellow-300/50 shadow-lg', animate: 'animate-pulse' };
  } else if (streak >= 1) {
    // Orange/red for active streak
    return { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-500', glow: '', animate: 'animate-pulse' };
  }
  // Gray for no streak
  return { bg: 'bg-muted', icon: 'text-muted-foreground', glow: '', animate: '' };
};

export const Performance = () => {
  const { sessions } = useMeditationSessions();
  const [dailyGoal, setDailyGoal] = useState(10);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  useEffect(() => {
    setDailyGoal(getDailyGoal());
  }, []);

  const handleSaveGoal = () => {
    const newGoal = parseInt(goalInput);
    if (newGoal > 0 && newGoal <= 180) {
      setDailyGoal(newGoal);
      saveDailyGoal(newGoal);
    }
    setIsEditingGoal(false);
  };

  const startEditingGoal = () => {
    setGoalInput(String(dailyGoal));
    setIsEditingGoal(true);
  };
  
  const streak = calculateStreak(sessions);
  const weeklySessions = getWeeklySessions(sessions);
  const monthlySessions = getMonthlySessions(sessions);
  const weeklyDuration = getTotalDuration(weeklySessions);
  const monthlyDuration = getTotalDuration(monthlySessions);
  const chartData = getWeeklyChartData(sessions);
  const flameStyles = getFlameStyles(streak);

  // Calculate today's progress
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaySessions = sessions.filter(s => s.date === today);
  const todayMinutes = Math.round(getTotalDuration(todaySessions) / 60);
  const progressPercent = Math.min((todayMinutes / dailyGoal) * 100, 100);
  const goalReached = todayMinutes >= dailyGoal;

  return (
    <div className="min-h-[70vh] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-light text-center text-foreground mb-8">Desempenho</h2>
        
        {/* Streak Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${flameStyles.bg} ${flameStyles.glow}`}>
              <Flame className={`w-6 h-6 ${flameStyles.icon} ${flameStyles.animate}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Sequência</p>
              {streak > 0 ? (
                <p className="text-2xl font-semibold text-foreground">
                  {streak} {streak === 1 ? 'dia' : 'dias'} seguidos {streak >= 2 && '🔥'}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Você ainda não iniciou sua sequência. Comece hoje!
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Daily Goal Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${goalReached ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}>
                <Target className={`w-5 h-5 ${goalReached ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`} />
              </div>
              <span className="text-sm font-medium text-foreground">Meta diária</span>
            </div>
            {!isEditingGoal ? (
              <Button variant="ghost" size="sm" onClick={startEditingGoal} className="gap-1">
                <Pencil className="w-3 h-3" />
                {dailyGoal} min
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="w-16 h-8 text-center text-sm"
                  min={1}
                  max={180}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                />
                <span className="text-sm text-muted-foreground">min</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveGoal}>
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className={goalReached ? 'text-green-600 dark:text-green-400 font-medium' : 'text-muted-foreground'}>
                {todayMinutes} min hoje
              </span>
              <span className="text-muted-foreground">
                {goalReached ? '✓ Meta atingida!' : `${Math.max(dailyGoal - todayMinutes, 0)} min restantes`}
              </span>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Esta semana</span>
            </div>
            <p className="text-xl font-semibold text-foreground">
              {formatDuration(weeklyDuration)}
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Este mês</span>
            </div>
            <p className="text-xl font-semibold text-foreground">
              {formatDuration(monthlyDuration)}
            </p>
          </Card>
        </div>

        {/* Session Counts */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Sessões</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-foreground">{weeklySessions.length}</p>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{monthlySessions.length}</p>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{sessions.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </Card>

        {/* Weekly Chart */}
        <Card className="p-6">
          <p className="text-sm font-medium text-foreground mb-4">Minutos por dia (semana atual)</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
                <Bar 
                  dataKey="minutes" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
