import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimer } from '@/hooks/useTimer';
import { useMeditationSessions } from '@/hooks/useMeditationSessions';
import { formatTime } from '@/utils/meditationStats';
import { playSound, getSavedSound, saveSound, SOUND_OPTIONS, SoundType } from '@/utils/sounds';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

const QUICK_TIMES = [5, 10, 15, 20];

const MOTIVATIONAL_QUOTES = [
  "Comece pequeno. 5 minutos hoje já valem mais do que 0 minutos.",
  "Cada respiração é uma oportunidade de recomeçar.",
  "A paz interior começa com um momento de silêncio.",
  "Meditar é se encontrar no presente.",
];

export const Timer = () => {
  const [customMinutes, setCustomMinutes] = useState('');
  const [selectedSound, setSelectedSound] = useState<SoundType>('bell');
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  const { saveSession } = useMeditationSessions();

  useEffect(() => {
    setSelectedSound(getSavedSound());
  }, []);

  const handleSoundChange = (value: SoundType) => {
    setSelectedSound(value);
    saveSound(value);
    playSound(value);
  };
  
  const handleComplete = useCallback(() => {
    playSound(selectedSound);
    const now = new Date();
    saveSession({
      started_at: new Date(now.getTime() - timer.totalSeconds * 1000).toISOString(),
      ended_at: now.toISOString(),
      duration_seconds: timer.totalSeconds,
      date: now.toISOString().split('T')[0],
    });
    toast.success('Sessão concluída! 🧘');
  }, [selectedSound]);
  
  const timer = useTimer(handleComplete);
  
  const handleQuickTime = (minutes: number) => {
    timer.setDuration(minutes);
  };
  
  const handleCustomTime = () => {
    const minutes = parseInt(customMinutes);
    if (minutes > 0 && minutes <= 180) {
      timer.setDuration(minutes);
      setCustomMinutes('');
    }
  };

  const handleCancel = () => {
    timer.reset();
    toast.info('Sessão cancelada');
  };
  
  const isTimerSet = timer.totalSeconds > 0;
  const isRunning = timer.status === 'running';
  const isPaused = timer.status === 'paused';
  const isIdle = timer.status === 'idle';

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
      <Card className="w-full max-w-md p-8 space-y-6">
        <h2 className="text-xl font-medium text-center text-foreground">
          Meditação de hoje
        </h2>
        
        {/* Timer Display */}
        <div className="text-center py-6">
          <div className={`text-7xl font-extralight tracking-wider transition-colors ${
            isRunning ? 'text-primary' : 'text-foreground'
          }`}>
            {formatTime(timer.remainingSeconds)}
          </div>
        </div>
        
        {/* Quick Time Buttons */}
        {isIdle && (
          <div className="space-y-4">
            <div className="flex justify-center gap-2 flex-wrap">
              {QUICK_TIMES.map(minutes => (
                <Button
                  key={minutes}
                  variant={timer.totalSeconds === minutes * 60 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQuickTime(minutes)}
                  className="min-w-[4rem]"
                >
                  {minutes} min
                </Button>
              ))}
            </div>
            
            {/* Custom Time Input */}
            <div className="flex flex-col items-center gap-2 pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">Tempo personalizado</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="w-16 text-center h-8"
                  min={1}
                  max={180}
                  placeholder="10"
                />
                <span className="text-sm text-muted-foreground">min</span>
                <Button variant="secondary" size="sm" onClick={handleCustomTime}>
                  Aplicar
                </Button>
              </div>
            </div>

            {/* Sound Selector */}
            <div className="flex flex-col items-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground">Som ao finalizar</span>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedSound} onValueChange={handleSoundChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {SOUND_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        
        {/* Control Buttons */}
        <div className="flex flex-col gap-3">
          {isIdle && isTimerSet && (
            <Button size="lg" onClick={timer.start} className="w-full gap-2">
              <Play className="w-5 h-5" />
              Iniciar
            </Button>
          )}
          
          {isRunning && (
            <>
              <Button size="lg" onClick={timer.pause} className="w-full gap-2">
                <Pause className="w-5 h-5" />
                Pausar
              </Button>
              <Button size="lg" variant="outline" onClick={handleCancel} className="w-full gap-2">
                <RotateCcw className="w-5 h-5" />
                Cancelar
              </Button>
            </>
          )}
          
          {isPaused && (
            <>
              <Button size="lg" onClick={timer.resume} className="w-full gap-2">
                <Play className="w-5 h-5" />
                Retomar
              </Button>
              <Button size="lg" variant="outline" onClick={handleCancel} className="w-full gap-2">
                <RotateCcw className="w-5 h-5" />
                Cancelar
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Motivational Quote */}
      <p className="mt-6 text-sm text-muted-foreground text-center max-w-sm px-4 italic">
        "{quote}"
      </p>
    </div>
  );
};
