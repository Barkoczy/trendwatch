'use client';

import React from 'react';
import { VideoGrid } from '@/components/VideoGrid';
import { useVideos } from '@/hooks/useVideos';
import { useSettingsContext } from '@/contexts/SettingsContext';

const Home: React.FC = () => {
  const { settings } = useSettingsContext();
  const { videos, isLoading, error } = useVideos(settings);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-[2160px] px-4 py-8">
        <VideoGrid videos={videos} isLoading={isLoading} error={error} />
      </div>
    </main>
  );
};

export default Home;
