'use client';
import React, { createContext, useContext } from 'react';
import { UserSettings } from '@/types/settings';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  isLoaded: boolean;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider = ({
  children,
  settings,
  updateSettings,
  isLoaded,
}: SettingsContextType & { children: React.ReactNode }) => {
  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error(
      'useSettingsContext must be used within a SettingsProvider'
    );
  }
  return context;
};
