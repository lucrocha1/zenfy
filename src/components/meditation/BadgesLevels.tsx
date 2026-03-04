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
import { Trophy, Star, Lock, Share2, Hash, Clock, Flame } from 'lucide-react';
import { ShareModal } from './ShareModal';

const LEVEL_EMOJIS: Record<number, string> = {
  1: '🌱',
  2: '🌿',
  3: '🎯',
  4: '🧘',
  5: '👑',
};

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

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu progresso de meditação no Zenfy',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setShareModalOpen(true);
        }
        return;
      }
    }

    setShareModalOpen(true);
  };

  // Sort badges: unlocked first (by priority), then locked by progress % desc
  const sortedBadges = [...BADGES].sort((a, b) => {
    const aUnlocked = a.isUnlocked(sessions, totalMinutes, maxStreak);
    const bUnlocked = b.isUnlocked(sessions, totalMinutes, maxStreak);
    
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    
    if (!aUnlocked && !bUnlocked) {
      const aProgress = a.getProgress(sessions, totalMinutes, maxStreak);
      const bProgress = b.getProgress(sessions, totalMinutes, maxStreak);
      
      const aPercent = aProgress ? (aProgress.current / aProgress.target) : 0;
      const bPercent = bProgress ? (bProgress.current / bProgress.target) : 0;
      
      return bPercent - aPercent;
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
            <div className="text-4xl">
              {LEVEL_EMOJIS[currentLevel.level] || '🌱'}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Seu nível</p>
              <p className="text-xl font-semibold text-foreground">
                Nível {currentLevel.level} – {currentLevel.name}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Progress value={percent} className="h-3">
                {percent > 25 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white mix-blend-difference">
                    {totalMinutes} / {nextLevel ? nextLevel.minMinutes : totalMinutes} min
                  </span>
                )}
              </Progress>
            </div>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
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
                  {LEVEL_EMOJIS[l.level]} {l.name}
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
              const progressPercent = progress ? Math.min((progress.current / progress.target) * 100, 100) : 0;
              
              return (
                <Card
                  key={badge.id}
                  className={`p-4 transition-all ${
                    unlocked
                      ? 'border-primary shadow-sm'
                      : 'bg-muted/30 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 ${
                        unlocked ? 'text-3xl' : 'text-2xl grayscale opacity-50'
                      }`}
                    >
                      {badge.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm ${
                          unlocked ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {badge.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {unlocked 
                          ? badge.description 
                          : badge.unlockDescription
                        }
                      </p>
                      {/* Progress bar for locked badges */}
                      {!unlocked && progress && (
                        <div className="mt-2 space-y-1">
                          <Progress value={progressPercent} className="h-1.5" />
                          <p className="text-[10px] text-muted-foreground">
                            {progress.current} / {progress.target}
                            {badge.id.includes('hour') || badge.id.includes('one_hour') || badge.id.includes('five_hours') || badge.id.includes('ten_hours') || badge.id.includes('twentyfour_hours') || badge.id.includes('fifty_hours') || badge.id.includes('hundred_hours')
                              ? ' min'
                              : badge.id.includes('streak') || badge.id.includes('long_session') || badge.id.includes('marathon')
                                ? ' dias'
                                : ' sessões'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                    {!unlocked && (
                      <Lock className="w-3 h-3 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Stats summary */}
        <Card className="p-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <p className="text-2xl font-semibold text-foreground">{sessions.length}</p>
              <p className="text-xs text-muted-foreground">Sessões</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-2xl font-semibold text-foreground">{totalMinutes}</p>
              <p className="text-xs text-muted-foreground">Minutos</p>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Flame className="w-4 h-4 text-muted-foreground" />
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
