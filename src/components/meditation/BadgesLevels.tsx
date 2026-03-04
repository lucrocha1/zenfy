import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useMeditationSessions } from '@/hooks/useMeditationSessions';
import { useStreakFreeze } from '@/hooks/useStreakFreeze';
import { getTotalDuration } from '@/utils/meditationStats';
import {
  getCurrentLevel,
  getNextLevel,
  getLevelProgress,
  calculateMaxStreak,
  BADGES,
  LEVELS,
} from '@/utils/gamification';
import { Trophy, Star, Check, Lock, Share2 } from 'lucide-react';
import { ShareModal } from './ShareModal';

export const BadgesLevels = () => {
  const { sessions } = useMeditationSessions();
  const { getFreezeDates } = useStreakFreeze();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  const totalMinutes = Math.round(getTotalDuration(sessions) / 60);
  const maxStreak = calculateMaxStreak(sessions, getFreezeDates());
  const currentLevel = getCurrentLevel(totalMinutes);
  const nextLevel = getNextLevel(currentLevel.level);
  const { percent, remaining } = getLevelProgress(totalMinutes);

  const levelName = `Nível ${currentLevel.level} – ${currentLevel.name}`;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share`;
    const shareText = `Tô usando o Zenfy pra criar o hábito de meditar 😌\nJá estou no ${levelName} e acumulando conquistas.\nDá uma olhada no meu progresso e vê se tu aguenta me acompanhar:\n👉 ${shareUrl}`;

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu progresso de meditação no Zenfy',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or error - fall through to modal
        if ((err as Error).name !== 'AbortError') {
          setShareModalOpen(true);
        }
        return;
      }
    }

    // Fallback to modal
    setShareModalOpen(true);
  };

  // Sort badges: unlocked first, then by proximity to being unlocked
  const sortedBadges = [...BADGES].sort((a, b) => {
    const aUnlocked = a.isUnlocked(sessions, totalMinutes, maxStreak);
    const bUnlocked = b.isUnlocked(sessions, totalMinutes, maxStreak);
    
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    
    if (!aUnlocked && !bUnlocked) {
      // Sort by proximity (progress percentage)
      const aProgress = a.getProgress(sessions, totalMinutes, maxStreak);
      const bProgress = b.getProgress(sessions, totalMinutes, maxStreak);
      
      const aPercent = aProgress ? (aProgress.current / aProgress.target) : 0;
      const bPercent = bProgress ? (bProgress.current / bProgress.target) : 0;
      
      return bPercent - aPercent; // Higher percentage = closer to unlock
    }
    
    return a.priority - b.priority;
  });

  return (
    <div className="min-h-[70vh] px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-light text-foreground">
            Badges & Níveis
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Compartilhar</span>
          </Button>
        </div>

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
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span>Você meditou {totalMinutes} min até agora</span>
              {nextLevel ? (
                <span className="text-foreground font-medium">
                  Faltam {remaining} min para o Nível {nextLevel.level} – {nextLevel.name}
                </span>
              ) : (
                <span className="text-primary font-medium">Nível máximo alcançado!</span>
              )}
            </div>
          </div>

          {/* Level progression */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">Progressão de níveis</p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
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
            {sortedBadges.map((badge) => {
              const unlocked = badge.isUnlocked(sessions, totalMinutes, maxStreak);
              const progress = badge.getProgress(sessions, totalMinutes, maxStreak);
              const remaining = progress ? progress.target - progress.current : null;
              
              return (
                <Card
                  key={badge.id}
                  className={`p-4 transition-all ${
                    unlocked
                      ? 'bg-card border-primary/30 shadow-sm'
                      : 'bg-muted/50 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`text-2xl flex-shrink-0 ${
                        unlocked ? '' : 'grayscale opacity-50'
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
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {unlocked 
                          ? badge.description 
                          : remaining !== null && remaining > 0
                            ? `${badge.unlockDescription} (faltam ${remaining}${badge.id.includes('hour') ? ' min' : ''})`
                            : badge.unlockDescription
                        }
                      </p>
                    </div>
                    {!unlocked && (
                      <Lock className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
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
              <p className="text-xs text-muted-foreground">Sessões totais</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{totalMinutes}</p>
              <p className="text-xs text-muted-foreground">Minutos totais</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{maxStreak}</p>
              <p className="text-xs text-muted-foreground">Maior sequência</p>
            </div>
          </div>
        </Card>
      </div>

      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        levelName={levelName}
      />
    </div>
  );
};
