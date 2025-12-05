import { Card } from '@/components/ui/card';
import { useMeditationSessions } from '@/hooks/useMeditationSessions';
import {
  formatDuration,
  getWeeklySessions,
  getMonthlySessions,
  getTotalDuration,
  calculateStreak,
  getWeeklyChartData,
} from '@/utils/meditationStats';
import { Flame, Calendar, Clock, Target } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export const Performance = () => {
  const { sessions } = useMeditationSessions();
  
  const streak = calculateStreak(sessions);
  const weeklySessions = getWeeklySessions(sessions);
  const monthlySessions = getMonthlySessions(sessions);
  const weeklyDuration = getTotalDuration(weeklySessions);
  const monthlyDuration = getTotalDuration(monthlySessions);
  const chartData = getWeeklyChartData(sessions);

  return (
    <div className="min-h-[70vh] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-light text-center text-foreground mb-8">Desempenho</h2>
        
        {/* Streak Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${streak >= 2 ? 'bg-orange-100' : 'bg-muted'}`}>
              <Flame className={`w-6 h-6 ${streak >= 2 ? 'text-orange-500' : 'text-muted-foreground'}`} />
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
