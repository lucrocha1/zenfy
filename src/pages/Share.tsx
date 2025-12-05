import { useMeditationSessions } from '@/hooks/useMeditationSessions';
import { getTotalDuration } from '@/utils/meditationStats';
import { calculateStreak } from '@/utils/meditationStats';
import {
  getCurrentLevel,
  calculateMaxStreak,
  BADGES,
} from '@/utils/gamification';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Share = () => {
  const { sessions, isLoading } = useMeditationSessions();

  const totalMinutes = Math.round(getTotalDuration(sessions) / 60);
  const currentStreak = calculateStreak(sessions);
  const maxStreak = calculateMaxStreak(sessions);
  const currentLevel = getCurrentLevel(totalMinutes);

  // Get unlocked badges (top 4)
  const unlockedBadges = BADGES
    .filter(badge => badge.isUnlocked(sessions, totalMinutes, maxStreak))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStreakText = () => {
    if (currentStreak >= 2) {
      return `Sequência atual: ${currentStreak} dias seguidos 🔥`;
    } else if (currentStreak === 1) {
      return `Sequência atual: 1 dia de meditação.`;
    }
    return `Começando do zero – pronto para o primeiro dia.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Zen Card */}
        <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-sm shadow-xl border-0">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🧘‍♀️</div>
            <h1 className="text-xl md:text-2xl font-semibold text-foreground">
              Meu progresso de meditação no Zenfy 🧘
            </h1>
          </div>

          {/* Level highlight */}
          <div className="text-center mb-6 p-4 bg-primary/10 rounded-xl">
            <p className="text-sm text-muted-foreground mb-1">Nível atual</p>
            <p className="text-2xl md:text-3xl font-bold text-primary">
              Nível {currentLevel.level} – {currentLevel.name}
            </p>
          </div>

          {/* Stats */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <span className="text-2xl">⏱️</span>
              <p className="text-foreground">
                Já meditei <span className="font-semibold">{totalMinutes} minutos</span>.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <span className="text-2xl">🔥</span>
              <p className="text-foreground">{getStreakText()}</p>
            </div>

            {maxStreak > currentStreak && maxStreak >= 2 && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-2xl">🏆</span>
                <p className="text-foreground">
                  Maior sequência: <span className="font-semibold">{maxStreak} dias seguidos</span> 🔥
                </p>
              </div>
            )}
          </div>

          {/* Unlocked badges */}
          {unlockedBadges.length > 0 && (
            <div className="mb-8">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Conquistas desbloqueadas
              </p>
              <div className="grid grid-cols-2 gap-2">
                {unlockedBadges.map(badge => (
                  <div
                    key={badge.id}
                    className="p-3 bg-primary/5 rounded-lg border border-primary/20"
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <p className="font-medium text-sm text-foreground">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center border-t border-border pt-6">
            <p className="text-muted-foreground mb-4">
              Tô usando o Zenfy pra criar o hábito de meditar todo dia. Quer começar também?
            </p>
            <Link to="/?ref=share">
              <Button size="lg" className="w-full text-base">
                Quero meditar também
              </Button>
            </Link>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Zenfy – Seu app de meditação minimalista
        </p>
      </div>
    </div>
  );
};

export default Share;
