import { useState, useRef, useCallback, useEffect } from 'react';

type TimerStatus = 'idle' | 'running' | 'paused' | 'stopwatch';

export const useTimer = (onComplete: (durationSeconds: number) => void) => {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const intervalRef = useRef<number | null>(null);

  const clearTimerInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const setDuration = useCallback((minutes: number) => {
    const seconds = minutes * 60;
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setElapsedSeconds(0);
    setStatus('idle');
    setStartedAt(null);
  }, []);

  const start = useCallback(() => {
    if (remainingSeconds <= 0) return;
    setStatus('running');
    setStartedAt(new Date());
    
    intervalRef.current = window.setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearTimerInterval();
          setStatus('idle');
          setTotalSeconds(current => {
            onComplete(current);
            return current;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [remainingSeconds, onComplete]);

  const startStopwatch = useCallback(() => {
    setStatus('stopwatch');
    setStartedAt(new Date());
    setElapsedSeconds(0);
    setTotalSeconds(0);
    setRemainingSeconds(0);
    
    intervalRef.current = window.setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  }, []);

  const stopAndSave = useCallback(() => {
    clearTimerInterval();
    const duration = elapsedSeconds;
    setStatus('idle');
    setElapsedSeconds(0);
    setStartedAt(null);
    if (duration > 0) {
      onComplete(duration);
    }
  }, [elapsedSeconds, onComplete]);

  const pause = useCallback(() => {
    clearTimerInterval();
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (remainingSeconds <= 0) return;
    setStatus('running');
    
    intervalRef.current = window.setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearTimerInterval();
          setStatus('idle');
          setTotalSeconds(current => {
            onComplete(current);
            return current;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [remainingSeconds, onComplete]);

  const reset = useCallback(() => {
    clearTimerInterval();
    setRemainingSeconds(totalSeconds);
    setElapsedSeconds(0);
    setStatus('idle');
    setStartedAt(null);
  }, [totalSeconds]);

  const getElapsedSeconds = useCallback(() => {
    return totalSeconds - remainingSeconds;
  }, [totalSeconds, remainingSeconds]);

  useEffect(() => {
    return () => clearTimerInterval();
  }, []);

  return {
    totalSeconds,
    remainingSeconds,
    elapsedSeconds,
    status,
    startedAt,
    setDuration,
    start,
    startStopwatch,
    stopAndSave,
    pause,
    resume,
    reset,
    getElapsedSeconds,
  };
};
