'use client';

import { useEffect, useState, useCallback } from 'react';
import { Video } from '@/types/video';

interface UseRelatedVideosOptions {
  limit?: number;
  currentChannelId?: string;
  revalidateSeconds?: number;
}

interface UseRelatedVideosReturn {
  videos: Video[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRelatedVideos(
  videoId: string,
  options: UseRelatedVideosOptions = {}
): UseRelatedVideosReturn {
  const { limit = 10, currentChannelId, revalidateSeconds = 3600 } = options;

  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const url = new URL(`${baseUrl}/api/related`);
      url.searchParams.append('videoId', videoId);

      const res = await fetch(url.toString(), {
        next: { revalidate: revalidateSeconds },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const fetchedVideos = data.items || [];

      // Filter and sort videos
      const processedVideos = fetchedVideos
        .filter((video: Video) => video.id !== videoId)
        .sort((a: Video, b: Video) => {
          if (currentChannelId) {
            if (
              a.channel.id !== currentChannelId &&
              b.channel.id === currentChannelId
            )
              return -1;
            if (
              a.channel.id === currentChannelId &&
              b.channel.id !== currentChannelId
            )
              return 1;
          }
          return 0;
        })
        .slice(0, limit);

      setVideos(processedVideos);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Nastala neočakávaná chyba')
      );
      console.error('Chyba pri načítaní súvisiacich videí:', err);
    } finally {
      setIsLoading(false);
    }
  }, [videoId, currentChannelId, limit, revalidateSeconds]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return {
    videos,
    isLoading,
    error,
    refetch: fetchVideos,
  };
}
