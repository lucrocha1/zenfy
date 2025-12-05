import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTimer } from '@/hooks/useTimer';
import { useMeditationSessions } from '@/hooks/useMeditationSessions';
import { formatTime } from '@/utils/meditationStats';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';
import { toast } from 'sonner';

const QUICK_TIMES = [5, 10, 15, 20];

// Simple bell sound using Web Audio API
const playBellSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(528, audioContext.currentTime);
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 2);
};

export const Timer = () => {
  const [customMinutes, setCustomMinutes] = useState('');
  const { saveSession } = useMeditationSessions();
  
  const handleComplete = useCallback(() => {
    playBellSound();
    const now = new Date();
    saveSession({
      started_at: new Date(now.getTime() - timer.totalSeconds * 1000).toISOString(),
      ended_at: now.toISOString(),
      duration_seconds: timer.totalSeconds,
      date: now.toISOString().split('T')[0],
    });
    toast.success('Sessão concluída! 🧘');
  }, []);
  
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
  
  const handleEndEarly = () => {
    const elapsed = timer.getElapsedSeconds();
    if (elapsed > 0 && timer.startedAt) {
      playBellSound();
      const now = new Date();
      saveSession({
        started_at: timer.startedAt.toISOString(),
        ended_at: now.toISOString(),
        duration_seconds: elapsed,
        date: now.toISOString().split('T')[0],
      });
      toast.success('Sessão salva! 🧘');
    }
    timer.reset();
  };
  
  const isTimerSet = timer.totalSeconds > 0;
  const isRunning = timer.status === 'running';
  const isPaused = timer.status === 'paused';
  const isIdle = timer.status === 'idle';

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md p-8 space-y-8">
        <h2 className="text-2xl font-light text-center text-foreground">Meditar</h2>
        
        {/* Timer Display */}
        <div className="text-center">
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
                >
                  {minutes} min
                </Button>
              ))}
            </div>
            
            {/* Custom Time Input */}
            <div className="flex gap-2 justify-center">
              <Input
                type="number"
                placeholder="Minutos"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                className="w-24 text-center"
                min={1}
                max={180}
              />
              <Button variant="outline" size="sm" onClick={handleCustomTime}>
                Definir
              </Button>
            </div>
          </div>
        )}
        
        {/* Control Buttons */}
        <div className="flex justify-center gap-3">
          {isIdle && isTimerSet && (
            <Button size="lg" onClick={timer.start} className="gap-2">
              <Play className="w-5 h-5" />
              Iniciar
            </Button>
          )}
          
          {isRunning && (
            <>
              <Button size="lg" variant="outline" onClick={timer.pause} className="gap-2">
                <Pause className="w-5 h-5" />
                Pausar
              </Button>
              <Button size="lg" variant="secondary" onClick={handleEndEarly} className="gap-2">
                <Check className="w-5 h-5" />
                Encerrar
              </Button>
            </>
          )}
          
          {isPaused && (
            <>
              <Button size="lg" onClick={timer.resume} className="gap-2">
                <Play className="w-5 h-5" />
                Retomar
              </Button>
              <Button size="lg" variant="outline" onClick={timer.reset} className="gap-2">
                <RotateCcw className="w-5 h-5" />
                Cancelar
              </Button>
              <Button size="lg" variant="secondary" onClick={handleEndEarly} className="gap-2">
                <Check className="w-5 h-5" />
                Encerrar
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
