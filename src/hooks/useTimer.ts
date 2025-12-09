import { useState, useRef, useCallback, useEffect } from 'react';

type TimerStatus = 'idle' | 'running' | 'paused' | 'stopwatch';

export const useTimer = (onComplete: (durationSeconds: number) => void) => {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  
  // Store start timestamp for accurate time calculation even when tab is backgrounded
  const startTimestampRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedTimeRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimerInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Calculate actual elapsed time based on timestamps (works even when JS is paused)
  const getActualElapsedMs = useCallback(() => {
    if (!startTimestampRef.current) return 0;
    const now = Date.now();
    return now - startTimestampRef.current - totalPausedTimeRef.current;
  }, []);

  const setDuration = useCallback((minutes: number) => {
    const seconds = minutes * 60;
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setElapsedSeconds(0);
    setStatus('idle');
    setStartedAt(null);
    startTimestampRef.current = null;
    pausedAtRef.current = null;
    totalPausedTimeRef.current = 0;
  }, []);

  const start = useCallback(() => {
    if (remainingSeconds <= 0) return;
    
    const now = Date.now();
    startTimestampRef.current = now;
    totalPausedTimeRef.current = 0;
    pausedAtRef.current = null;
    
    setStatus('running');
    setStartedAt(new Date());
    
    intervalRef.current = window.setInterval(() => {
      const elapsedMs = Date.now() - startTimestampRef.current! - totalPausedTimeRef.current;
      const elapsedSecs = Math.floor(elapsedMs / 1000);
      const remaining = Math.max(0, totalSeconds - elapsedSecs);
      
      setRemainingSeconds(remaining);
      
      if (remaining <= 0) {
        clearTimerInterval();
        setStatus('idle');
        onCompleteRef.current(totalSeconds);
      }
    }, 1000);
  }, [remainingSeconds, totalSeconds]);

  const startStopwatch = useCallback(() => {
    const now = Date.now();
    startTimestampRef.current = now;
    totalPausedTimeRef.current = 0;
    pausedAtRef.current = null;
    
    setStatus('stopwatch');
    setStartedAt(new Date());
    setElapsedSeconds(0);
    setTotalSeconds(0);
    setRemainingSeconds(0);
    
    intervalRef.current = window.setInterval(() => {
      const elapsedMs = Date.now() - startTimestampRef.current! - totalPausedTimeRef.current;
      setElapsedSeconds(Math.floor(elapsedMs / 1000));
    }, 1000);
  }, []);

  const stopAndSave = useCallback(() => {
    clearTimerInterval();
    
    // Calculate actual elapsed time from timestamps
    const actualElapsedMs = getActualElapsedMs();
    const duration = Math.floor(actualElapsedMs / 1000);
    
    setStatus('idle');
    setElapsedSeconds(0);
    setStartedAt(null);
    startTimestampRef.current = null;
    totalPausedTimeRef.current = 0;
    
    if (duration > 0) {
      onCompleteRef.current(duration);
    }
  }, [getActualElapsedMs]);

  const pause = useCallback(() => {
    clearTimerInterval();
    pausedAtRef.current = Date.now();
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (remainingSeconds <= 0) return;
    
    // Add the paused duration to total paused time
    if (pausedAtRef.current) {
      totalPausedTimeRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    
    setStatus('running');
    
    intervalRef.current = window.setInterval(() => {
      const elapsedMs = Date.now() - startTimestampRef.current! - totalPausedTimeRef.current;
      const elapsedSecs = Math.floor(elapsedMs / 1000);
      const remaining = Math.max(0, totalSeconds - elapsedSecs);
      
      setRemainingSeconds(remaining);
      
      if (remaining <= 0) {
        clearTimerInterval();
        setStatus('idle');
        onCompleteRef.current(totalSeconds);
      }
    }, 1000);
  }, [remainingSeconds, totalSeconds]);

  const reset = useCallback(() => {
    clearTimerInterval();
    setRemainingSeconds(totalSeconds);
    setElapsedSeconds(0);
    setStatus('idle');
    setStartedAt(null);
    startTimestampRef.current = null;
    pausedAtRef.current = null;
    totalPausedTimeRef.current = 0;
  }, [totalSeconds]);

  const getElapsedSeconds = useCallback(() => {
    return totalSeconds - remainingSeconds;
  }, [totalSeconds, remainingSeconds]);

  // Handle visibility change - recalculate time when app comes back to foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && startTimestampRef.current) {
        const elapsedMs = getActualElapsedMs();
        const elapsedSecs = Math.floor(elapsedMs / 1000);
        
        if (status === 'running') {
          const remaining = Math.max(0, totalSeconds - elapsedSecs);
          setRemainingSeconds(remaining);
          
          // Check if timer should have completed while backgrounded
          if (remaining <= 0) {
            clearTimerInterval();
            setStatus('idle');
            onCompleteRef.current(totalSeconds);
          }
        } else if (status === 'stopwatch') {
          setElapsedSeconds(elapsedSecs);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [status, totalSeconds, getActualElapsedMs]);

  // Cleanup on unmount
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
