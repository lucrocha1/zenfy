import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMeditationSessions } from '@/hooks/useMeditationSessions';
import { getTotalDuration } from '@/utils/meditationStats';
import {
  getCurrentLevel,
  getNextLevel,
  getLevelProgress,
  calculateMaxStreak,
  BADGES,
} from '@/utils/gamification';
import { Trophy, Star, Check, Lock } from 'lucide-react';

export const BadgesLevels = () => {
  const { sessions } = useMeditationSessions();
  
  const totalMinutes = Math.round(getTotalDuration(sessions) / 60);
  const maxStreak = calculateMaxStreak(sessions);
  const currentLevel = getCurrentLevel(totalMinutes);
  const nextLevel = getNextLevel(currentLevel.level);
  const { percent, remaining } = getLevelProgress(totalMinutes);

  return (
    <div className="min-h-[70vh] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-light text-center text-foreground mb-8">
          Badges & Níveis
        </h2>

        {/* Level Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Seu nível</p>
              <p className="text-xl font-semibold text-foreground">
                Nível {currentLevel.level} – {currentLevel.name}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress value={percent} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{totalMinutes} min total</span>
              {nextLevel ? (
                <span>Faltam {remaining} min para o próximo nível</span>
              ) : (
                <span className="text-primary font-medium">Nível máximo alcançado! 🏆</span>
              )}
            </div>
          </div>

          {/* Level progression */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">Progressão de níveis</p>
            <div className="flex flex-wrap gap-2">
              {[
                { level: 1, name: 'Iniciante', min: 0 },
                { level: 2, name: 'Constante', min: 50 },
                { level: 3, name: 'Focado', min: 200 },
                { level: 4, name: 'Zen', min: 500 },
                { level: 5, name: 'Mestre Zen', min: 1000 },
              ].map((l) => (
                <div
                  key={l.level}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    currentLevel.level >= l.level
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {l.name}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Badges Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground">Conquistas</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BADGES.map((badge) => {
              const unlocked = badge.isUnlocked(sessions, totalMinutes, maxStreak);
              
              return (
                <Card
                  key={badge.id}
                  className={`p-4 transition-all ${
                    unlocked
                      ? 'bg-card border-primary/20'
                      : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`text-2xl flex-shrink-0 ${
                        unlocked ? '' : 'grayscale'
                      }`}
                    >
                      {badge.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-medium text-sm ${
                            unlocked ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {badge.name}
                        </p>
                        {unlocked && (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {unlocked ? badge.description : badge.unlockDescription}
                      </p>
                    </div>
                    {!unlocked && (
                      <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Stats summary */}
        <Card className="p-4 bg-muted/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-foreground">{sessions.length}</p>
              <p className="text-xs text-muted-foreground">Sessões</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{totalMinutes}</p>
              <p className="text-xs text-muted-foreground">Minutos</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{maxStreak}</p>
              <p className="text-xs text-muted-foreground">Max streak</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
