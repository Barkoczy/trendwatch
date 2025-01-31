'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { useYouTubeTrending } from '@/hooks/useYouTubeTrending';
import { useSettings } from '@/hooks/useSettings';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';

const Home: React.FC = () => {
  const { settings, updateSettings, isLoaded } = useSettings();
  const { videos, isLoading, error } = useYouTubeTrending(settings);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            Nastala chyba pri načítaní videí. Skúste to prosím neskôr.
          </AlertDescription>
        </Alert>
      );
    }

    if (!videos.length) {
      return (
        <Alert className="mb-6">
          <AlertDescription>
            Neboli nájdené žiadne videá pre zvolené kritériá.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            videoId={video.id}
            title={video.snippet.title}
            thumbnail={video.snippet.thumbnails.high.url}
            channelTitle={video.snippet.channelTitle}
          />
        ))}
      </div>
    );
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Header settings={settings} onSettingsChange={updateSettings} />
      <main className="min-h-screen bg-gradient-to-b from-gray-100 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4 py-8">{renderContent()}</div>
      </main>
    </>
  );
};

export default Home;
