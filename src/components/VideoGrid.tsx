'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import VideoCard from './VideoCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Video } from '@/types/video';

interface VideoGridProps {
  videos?: Video[];
  isLoading?: boolean;
  error?: string | Error | null;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  isLoading,
  error,
}) => {
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
          {error instanceof Error ? error.message : error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!videos?.length) {
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
      {videos.map((video: Video, index: number) => (
        <VideoCard
          key={video.id || index}
          videoId={video.id}
          title={video.title}
          thumbnail={video.thumbnails.high.url}
          channel={{
            title: video.channel.title,
            thumbnail: video.channel.thumbnail,
          }}
          statistics={{
            viewCount: video.statistics.viewCount,
          }}
          publishedAt={video.publishedAt}
          duration={video.contentDetails.duration}
        />
      ))}
    </div>
  );
};
