import { useEffect, useState, useCallback } from 'react';
import { MeditationSession } from '@/types/meditation';
import { getTotalDuration } from '@/utils/meditationStats';
import { getCurrentLevel, calculateMaxStreak, BADGES, Badge } from '@/utils/gamification';

interface CelebrationData {
  type: 'badge' | 'level';
  title: string;
  description: string;
  icon: string;
}

const STORAGE_KEY = 'meditation_achievements_state';

interface SavedState {
  unlockedBadgeIds: string[];
  currentLevel: number;
}

const getSavedState = (): SavedState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading achievements state:', e);
  }
  return { unlockedBadgeIds: [], currentLevel: 0 };
};

const saveState = (state: SavedState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving achievements state:', e);
  }
};

export const useAchievementCelebration = (sessions: MeditationSession[]) => {
  const [celebration, setCelebration] = useState<CelebrationData | null>(null);
  const [queue, setQueue] = useState<CelebrationData[]>([]);

  const dismissCelebration = useCallback(() => {
    setCelebration(null);
    // Show next in queue after a short delay
    setTimeout(() => {
      setQueue(prev => {
        if (prev.length > 0) {
          setCelebration(prev[0]);
          return prev.slice(1);
        }
        return prev;
      });
    }, 300);
  }, []);

  useEffect(() => {
    if (sessions.length === 0) return;

    const totalMinutes = Math.round(getTotalDuration(sessions) / 60);
    const maxStreak = calculateMaxStreak(sessions);
    const currentLevel = getCurrentLevel(totalMinutes);
    
    // Get current unlocked badges
    const currentUnlockedBadges = BADGES.filter(badge => 
      badge.isUnlocked(sessions, totalMinutes, maxStreak)
    );
    const currentUnlockedIds = currentUnlockedBadges.map(b => b.id);

    // Get saved state
    const savedState = getSavedState();
    
    const newCelebrations: CelebrationData[] = [];

    // Check for new badges
    currentUnlockedIds.forEach(id => {
      if (!savedState.unlockedBadgeIds.includes(id)) {
        const badge = BADGES.find(b => b.id === id);
        if (badge) {
          newCelebrations.push({
            type: 'badge',
            title: badge.name,
            description: badge.description,
            icon: badge.icon,
          });
        }
      }
    });

    // Check for level up
    if (currentLevel.level > savedState.currentLevel && savedState.currentLevel > 0) {
      newCelebrations.unshift({
        type: 'level',
        title: `Nível ${currentLevel.level}`,
        description: `Parabéns! Você alcançou o nível ${currentLevel.name}!`,
        icon: '🏆',
      });
    }

    // Save new state
    saveState({
      unlockedBadgeIds: currentUnlockedIds,
      currentLevel: currentLevel.level,
    });

    // Queue celebrations
    if (newCelebrations.length > 0) {
      if (!celebration) {
        setCelebration(newCelebrations[0]);
        setQueue(newCelebrations.slice(1));
      } else {
        setQueue(prev => [...prev, ...newCelebrations]);
      }
    }
  }, [sessions]);

  return { celebration, dismissCelebration };
};
