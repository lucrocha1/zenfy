import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Challenge, CHALLENGE_PRESETS } from '@/hooks/useChallenges';
import { useMeditationSessions } from '@/hooks/useMeditationSessions';
import { useChallenges } from '@/hooks/useChallenges';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Flag, X, Trophy } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface ChallengeCardProps {
  challenge: Challenge;
}

export const ChallengeCard = ({ challenge }: ChallengeCardProps) => {
  const { sessions } = useMeditationSessions();
  const { calculateProgress, updateChallengeProgress, abandonChallenge } = useChallenges();
  
  const preset = CHALLENGE_PRESETS.find(p => p.type === challenge.challenge_type);
  const progress = calculateProgress(challenge, sessions);
  const daysRemaining = differenceInDays(parseISO(challenge.end_date), new Date()) + 1;

  // Update progress in database when it changes
  useEffect(() => {
    if (challenge.status !== 'active') return;
    
    const newStatus = progress.completed ? 'completed' : progress.failed ? 'failed' : undefined;
    
    if (progress.progressDays !== challenge.progress_days || newStatus) {
      updateChallengeProgress(challenge.id, progress.progressDays, newStatus);
      
      if (newStatus === 'completed') {
        toast.success('🏆 Desafio completado!', {
          description: `Você completou ${challenge.name}!`,
        });
      } else if (newStatus === 'failed') {
        toast.error('💔 Desafio falhou', {
          description: 'Você perdeu um dia e o desafio foi encerrado.',
        });
      }
    }
  }, [progress.progressDays, progress.completed, progress.failed, challenge, updateChallengeProgress]);

  const handleAbandon = () => {
    if (confirm('Tem certeza que deseja abandonar este desafio?')) {
      abandonChallenge(challenge.id);
    }
  };

  const statusColors = {
    active: 'border-primary/30',
    completed: 'border-green-500/50 bg-green-50 dark:bg-green-950/20',
    failed: 'border-red-500/50 bg-red-50 dark:bg-red-950/20',
    abandoned: 'border-muted opacity-60',
  };

  return (
    <Card className={`p-4 ${statusColors[challenge.status]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{preset?.icon || '📅'}</span>
          <div>
            <p className="font-medium text-foreground">{challenge.name}</p>
            <p className="text-xs text-muted-foreground">
              {challenge.target_days} dias • {format(parseISO(challenge.start_date), "d 'de' MMM", { locale: ptBR })}
            </p>
          </div>
        </div>
        {challenge.status === 'active' && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleAbandon}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        {challenge.status === 'completed' && (
          <Trophy className="w-5 h-5 text-green-500" />
        )}
      </div>

      <div className="space-y-2">
        <Progress value={progress.percentage} className="h-2" />
        <div className="flex justify-between text-xs">
          <span className="text-foreground font-medium">
            {progress.progressDays} / {challenge.target_days} dias
          </span>
          {challenge.status === 'active' && daysRemaining > 0 && (
            <span className="text-muted-foreground">
              {daysRemaining} dias restantes
            </span>
          )}
          {challenge.status === 'completed' && (
            <span className="text-green-600 dark:text-green-400 font-medium">
              Completado! 🎉
            </span>
          )}
          {challenge.status === 'failed' && (
            <span className="text-red-600 dark:text-red-400">
              Encerrado
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
