import { useState, useEffect } from 'react';
import { UserSettings } from '@/types/settings';

const DEFAULT_SETTINGS: UserSettings = {
  region: 'SK',
  maxResults: 12,
  includeShorts: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userSettings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored settings:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('userSettings', JSON.stringify(updated));
      return updated;
    });
  };

  return { settings, updateSettings, isLoaded };
}
