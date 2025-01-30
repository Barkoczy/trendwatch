'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { useYouTubeTrending } from '@/hooks/useYouTubeTrending';
import { useSettings } from '@/hooks/useSettings';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RegionSelect from '@/components/RegionSelect';

const resultOptions = [8, 12, 24, 48];

const Home: React.FC = () => {
  const { settings, updateSettings, isLoaded } = useSettings();
  const { videos, isLoading, error } = useYouTubeTrending({
    regionCode: settings.region,
    maxResults: settings.maxResults,
    includeShorts: settings.includeShorts,
  });

  const handleRegionChange = (value: string) => {
    updateSettings({ region: value });
  };

  const handleMaxResultsChange = (value: number) => {
    updateSettings({ maxResults: value });
  };

  const handleShortsToggle = (checked: boolean) => {
    updateSettings({ includeShorts: checked });
  };

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
            Neboli nájdené žiadne videá pre zvolený región.
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
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="dark:bg-background sticky top-[56px] z-40 w-full border-b border-gray-200 bg-white dark:border-slate-800 dark:backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <RegionSelect
              value={settings.region}
              onChange={handleRegionChange}
            />

            <div className="flex flex-1 flex-col gap-1">
              <Label className="text-foreground mb-2">Počet výsledkov</Label>
              <div className="flex flex-wrap gap-2">
                {resultOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleMaxResultsChange(option)}
                    className={`rounded-md px-4 py-2 transition-colors ${
                      settings.maxResults === option
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <Label className="text-foreground mb-2">Nastavenia</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="shorts-toggle"
                  checked={settings.includeShorts}
                  onCheckedChange={handleShortsToggle}
                />
                <Label
                  htmlFor="shorts-toggle"
                  className="text-foreground cursor-pointer"
                >
                  Zahrnúť Shorts
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">{renderContent()}</div>
    </div>
  );
};

export default Home;
