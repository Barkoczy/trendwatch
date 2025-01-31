'use client';

import { useState, useEffect } from 'react';
import { UserSettings } from '@/types/settings';
import { defaultRegionCode } from '@/constants/regions';

const DEFAULT_SETTINGS: UserSettings = {
  regionCode: defaultRegionCode,
  maxResults: 12,
  includeShorts: false,
  order: 'mostPopular',
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('userSettings');
      if (stored) {
        try {
          setSettings(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse stored settings:', e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (typeof window !== 'undefined') {
        localStorage.setItem('userSettings', JSON.stringify(updated));
      }
      return updated;
    });
  };

  return { settings, updateSettings, isLoaded };
}
