import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStreakFreeze } from '@/hooks/useStreakFreeze';
import { Snowflake, Shield } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const StreakFreezeCard = () => {
  const { availableFreezes, canUseFreeze, useFreeze, loading } = useStreakFreeze();

  const handleUseFreeze = async () => {
    await useFreeze();
  };

  const yesterday = subDays(new Date(), 1);
  const showUseButton = canUseFreeze();

  return (
    <Card className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 border-sky-200/50 dark:border-sky-800/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-sky-100 dark:bg-sky-900/50">
            <Snowflake className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <p className="font-medium text-foreground flex items-center gap-2">
              Streak Freeze
              <span className="text-xs bg-sky-200 dark:bg-sky-800 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full">
                {availableFreezes} disponível{availableFreezes !== 1 ? 's' : ''}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              {showUseButton 
                ? `Proteja seu streak de ${format(yesterday, "d 'de' MMM", { locale: ptBR })}`
                : 'Protege sua sequência se perder um dia'
              }
            </p>
          </div>
        </div>
        
        {showUseButton && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleUseFreeze}
            disabled={loading}
            className="gap-1.5 bg-sky-100 hover:bg-sky-200 text-sky-700 dark:bg-sky-900 dark:hover:bg-sky-800 dark:text-sky-300"
          >
            <Shield className="w-4 h-4" />
            Usar
          </Button>
        )}
      </div>
    </Card>
  );
};
