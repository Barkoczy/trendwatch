'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { useSettings } from '@/hooks/useSettings';
import { SettingsProvider } from '@/contexts/SettingsContext';

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const { settings, updateSettings, isLoaded } = useSettings();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SettingsProvider
      settings={settings}
      updateSettings={updateSettings}
      isLoaded={isLoaded}
    >
      <Header settings={settings} onSettingsChange={updateSettings} />
      {children}
    </SettingsProvider>
  );
};

export default ClientLayout;
