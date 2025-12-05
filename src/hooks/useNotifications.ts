import { useState, useEffect, useCallback } from 'react';

const REMINDERS_KEY = 'meditation_reminders';

export interface Reminder {
  id: string;
  time: string; // HH:MM format
  enabled: boolean;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    const stored = localStorage.getItem(REMINDERS_KEY);
    if (stored) {
      setReminders(JSON.parse(stored));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const saveReminders = useCallback((newReminders: Reminder[]) => {
    setReminders(newReminders);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(newReminders));
  }, []);

  const addReminder = useCallback((time: string) => {
    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      time,
      enabled: true,
    };
    saveReminders([...reminders, newReminder]);
  }, [reminders, saveReminders]);

  const removeReminder = useCallback((id: string) => {
    saveReminders(reminders.filter(r => r.id !== id));
  }, [reminders, saveReminders]);

  const toggleReminder = useCallback((id: string) => {
    saveReminders(
      reminders.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }, [reminders, saveReminders]);

  const sendNotification = useCallback((title: string, body: string) => {
    if (permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.png',
        badge: '/favicon.png',
      });
    }
  }, [permission]);

  // Check reminders every minute
  useEffect(() => {
    if (permission !== 'granted') return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      reminders.forEach(reminder => {
        if (reminder.enabled && reminder.time === currentTime) {
          sendNotification(
            '🧘 Hora de meditar!',
            'Reserve alguns minutos para sua prática de meditação.'
          );
        }
      });
    };

    // Check immediately
    checkReminders();

    // Then check every minute
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [reminders, permission, sendNotification]);

  return {
    permission,
    reminders,
    requestPermission,
    addReminder,
    removeReminder,
    toggleReminder,
    sendNotification,
    isSupported: 'Notification' in window,
  };
};
