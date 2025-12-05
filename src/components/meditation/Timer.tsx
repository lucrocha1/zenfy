import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimer } from '@/hooks/useTimer';
import { useMeditationSessions } from '@/hooks/useMeditationSessions';
import { formatTime, getTodaySessions, getTotalDuration, calculateStreak, getDailyGoal } from '@/utils/meditationStats';
import { 
  playSound, 
  getSavedSound, 
  saveSound, 
  SOUND_OPTIONS, 
  SoundType,
  AMBIENT_SOUND_OPTIONS,
  AmbientSoundType,
  getSavedAmbientSound,
  saveAmbientSound,
  ambientPlayer
} from '@/utils/sounds';
import { SessionCompleteModal } from './SessionCompleteModal';
import { Play, Pause, RotateCcw, Volume2, Music, Infinity, Square } from 'lucide-react';
import { toast } from 'sonner';

const QUICK_TIMES = [5, 10, 15, 20];

const MOTIVATIONAL_QUOTES = [
  "Comece pequeno. 5 min hoje já valem mais do que 0 min.",
  "Cada respiração é uma oportunidade de recomeçar.",
  "A paz interior começa com um momento de silêncio.",
  "Meditar é se encontrar no presente.",
];

export const Timer = () => {
  const [customMinutes, setCustomMinutes] = useState('');
  const [selectedSound, setSelectedSound] = useState<SoundType>('bell');
  const [selectedAmbient, setSelectedAmbient] = useState<AmbientSoundType>('silent');
  const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completedDuration, setCompletedDuration] = useState(0);
  const [isFreeMode, setIsFreeMode] = useState(false);
  const [goalReachedDuringSession, setGoalReachedDuringSession] = useState(false);
  const goalNotifiedRef = useRef(false);
  const { sessions, saveSession } = useMeditationSessions();
  
  const todaySessions = getTodaySessions(sessions);
  const todayMinutes = Math.round(getTotalDuration(todaySessions) / 60);
  const streak = calculateStreak(sessions);
  const dailyGoal = getDailyGoal();

  useEffect(() => {
    setSelectedSound(getSavedSound());
    setSelectedAmbient(getSavedAmbientSound());
  }, []);

  const handleSoundChange = (value: SoundType) => {
    setSelectedSound(value);
    saveSound(value);
    playSound(value);
  };

  const handleAmbientChange = (value: AmbientSoundType) => {
    setSelectedAmbient(value);
    saveAmbientSound(value);
  };
  
  const handleComplete = useCallback((duration: number) => {
    ambientPlayer.stop();
    playSound(selectedSound);
    const now = new Date();
    saveSession({
      started_at: new Date(now.getTime() - duration * 1000).toISOString(),
      ended_at: now.toISOString(),
      duration_seconds: duration,
      date: now.toISOString().split('T')[0],
    });
    setCompletedDuration(duration);
    setShowCompleteModal(true);
    setIsFreeMode(false);
  }, [selectedSound, saveSession]);
  
  const timer = useTimer(handleComplete);

  // Check if daily goal is reached during free mode
  useEffect(() => {
    if (timer.status === 'stopwatch' && !goalNotifiedRef.current) {
      const currentSessionMinutes = Math.floor(timer.elapsedSeconds / 60);
      const totalWithSession = todayMinutes + currentSessionMinutes;
      
      if (totalWithSession >= dailyGoal && todayMinutes < dailyGoal) {
        goalNotifiedRef.current = true;
        setGoalReachedDuringSession(true);
        toast.success('🎉 Meta diária atingida!', {
          description: `Você completou ${dailyGoal} minutos de meditação hoje!`,
          duration: 5000,
        });
      }
    }
  }, [timer.status, timer.elapsedSeconds, todayMinutes, dailyGoal]);

  // Reset goal notification flag when session ends
  useEffect(() => {
    if (timer.status === 'idle') {
      goalNotifiedRef.current = false;
      setGoalReachedDuringSession(false);
    }
  }, [timer.status]);

  // Start/stop ambient sound based on timer state
  useEffect(() => {
    if (timer.status === 'running' || timer.status === 'stopwatch') {
      ambientPlayer.start(selectedAmbient);
    } else if (timer.status === 'idle') {
      ambientPlayer.stop();
    }
  }, [timer.status, selectedAmbient]);

  // Stop ambient on pause
  useEffect(() => {
    if (timer.status === 'paused') {
      ambientPlayer.stop();
    }
  }, [timer.status]);
  
  const handleQuickTime = (minutes: number) => {
    setIsFreeMode(false);
    timer.setDuration(minutes);
  };

  const handleFreeMode = () => {
    setIsFreeMode(true);
    timer.setDuration(0);
  };
  
  const handleCustomTime = () => {
    const minutes = parseInt(customMinutes);
    if (minutes > 0 && minutes <= 180) {
      setIsFreeMode(false);
      timer.setDuration(minutes);
      setCustomMinutes('');
    }
  };

  const handleCancel = () => {
    ambientPlayer.stop();
    timer.reset();
    setIsFreeMode(false);
  };

  const handleStopAndSave = () => {
    timer.stopAndSave();
  };

  const handleCloseCompleteModal = () => {
    setShowCompleteModal(false);
    setCompletedDuration(0);
  };
  
  const isTimerSet = timer.totalSeconds > 0 || isFreeMode;
  const isRunning = timer.status === 'running';
  const isPaused = timer.status === 'paused';
  const isIdle = timer.status === 'idle';
  const isStopwatch = timer.status === 'stopwatch';

  const displayTime = isStopwatch ? timer.elapsedSeconds : timer.remainingSeconds;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
      <SessionCompleteModal
        isOpen={showCompleteModal}
        onClose={handleCloseCompleteModal}
        sessions={sessions}
        sessionDuration={completedDuration}
        goalReachedDuringSession={goalReachedDuringSession}
      />

      <Card className="w-full max-w-md p-8 space-y-6">
        <h2 className="text-xl font-medium text-center text-foreground">
          {isStopwatch ? 'Meditação Livre' : 'Meditação de hoje'}
        </h2>
        
        {/* Timer Display */}
        <div className="text-center py-6">
          <div className={`text-7xl font-extralight tracking-wider transition-colors ${
            isRunning || isStopwatch ? 'text-primary' : 'text-foreground'
          }`}>
            {formatTime(displayTime)}
          </div>
          {isStopwatch && (
            <p className="text-sm text-muted-foreground mt-2">
              Medite pelo tempo que quiser
            </p>
          )}
        </div>
        
        {/* Quick Time Buttons */}
        {isIdle && (
          <div className="space-y-4">
            <div className="flex justify-center gap-2 flex-wrap">
              {QUICK_TIMES.map(minutes => (
                <Button
                  key={minutes}
                  variant={!isFreeMode && timer.totalSeconds === minutes * 60 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleQuickTime(minutes)}
                  className="min-w-[4rem]"
                >
                  {minutes} min
                </Button>
              ))}
              <Button
                variant={isFreeMode ? 'default' : 'outline'}
                size="sm"
                onClick={handleFreeMode}
                className="min-w-[4rem] gap-1"
              >
                <Infinity className="w-4 h-4" />
                Livre
              </Button>
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

            {/* Sound Selectors - Side by Side */}
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              {/* Ambient Sound */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">Durante</span>
                <div className="flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-muted-foreground" />
                  <Select value={selectedAmbient} onValueChange={handleAmbientChange}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {AMBIENT_SOUND_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Finish Sound */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">Ao finalizar</span>
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <Select value={selectedSound} onValueChange={handleSoundChange}>
                    <SelectTrigger className="w-[130px]">
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
          </div>
        )}
        
        {/* Control Buttons */}
        <div className="flex flex-col gap-3">
          {isIdle && isTimerSet && !isFreeMode && (
            <Button size="lg" onClick={timer.start} className="w-full gap-2">
              <Play className="w-5 h-5" />
              Iniciar
            </Button>
          )}

          {isIdle && isFreeMode && (
            <Button size="lg" onClick={timer.startStopwatch} className="w-full gap-2">
              <Play className="w-5 h-5" />
              Começar Meditação Livre
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

          {isStopwatch && (
            <>
              <Button size="lg" onClick={handleStopAndSave} className="w-full gap-2">
                <Square className="w-5 h-5" />
                Encerrar e Salvar
              </Button>
              <Button size="lg" variant="outline" onClick={handleCancel} className="w-full gap-2">
                <RotateCcw className="w-5 h-5" />
                Cancelar sem salvar
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

      {/* Today's Quick Stats */}
      <p className="mt-4 text-sm text-muted-foreground text-center">
        Hoje: {todayMinutes} min · {todaySessions.length} {todaySessions.length === 1 ? 'sessão' : 'sessões'} · sequência {streak} {streak >= 1 && '🔥'}
      </p>

      {/* Motivational Quote */}
      <p className="mt-2 text-sm text-muted-foreground/70 text-center max-w-sm px-4 italic">
        "{quote}"
      </p>
    </div>
  );
};
