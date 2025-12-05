import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MeditationSession } from '@/types/meditation';
import { calculateStreak, getTodaySessions, getTotalDuration } from '@/utils/meditationStats';
import { BADGES, calculateMaxStreak } from '@/utils/gamification';
import { Sparkles } from 'lucide-react';

interface SessionCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: MeditationSession[];
  sessionDuration: number; // in seconds
}

export const SessionCompleteModal = ({
  isOpen,
  onClose,
  sessions,
  sessionDuration,
}: SessionCompleteModalProps) => {
  const sessionMinutes = Math.round(sessionDuration / 60);
  const todaySessions = getTodaySessions(sessions);
  const todayMinutes = Math.round(getTotalDuration(todaySessions) / 60);
  const streak = calculateStreak(sessions);
  const totalMinutes = Math.round(getTotalDuration(sessions) / 60);
  const maxStreak = calculateMaxStreak(sessions);

  // Find newly unlocked badges (simplified check - badges that are now unlocked)
  const unlockedBadges = BADGES.filter(b => b.isUnlocked(sessions, totalMinutes, maxStreak));
  const latestBadge = unlockedBadges.length > 0 ? unlockedBadges[unlockedBadges.length - 1] : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-none bg-gradient-to-b from-primary/5 to-background">
        <div className="flex flex-col items-center text-center py-6">
          {/* Success Icon */}
          <div className="relative mb-4">
            <div className="text-5xl animate-bounce-in">🧘</div>
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-500 animate-spin-slow" />
          </div>

          {/* Main Message */}
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Meditação concluída!
          </h2>
          <p className="text-2xl font-bold text-primary mb-4">
            +{sessionMinutes} min hoje
          </p>

          {/* Stats */}
          <div className="w-full space-y-2 mb-6">
            <div className="flex justify-between text-sm px-4 py-2 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Total hoje</span>
              <span className="font-medium text-foreground">{todayMinutes} min</span>
            </div>
            
            {streak >= 1 && (
              <div className="flex justify-between text-sm px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <span className="text-muted-foreground">
                  {streak >= 2 ? 'Sequência mantida!' : 'Sequência iniciada!'}
                </span>
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {streak} {streak === 1 ? 'dia' : 'dias'} 🔥
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button onClick={onClose} className="w-full">
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
