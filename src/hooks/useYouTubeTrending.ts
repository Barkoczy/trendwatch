import { useState, useEffect } from 'react';
import { getCache, setCache } from '@/libs/RedisClient';
import { UserSettings } from '@/types/settings';
import { Video } from '@/types/video';

export function useYouTubeTrending(settings: UserSettings) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);

      // Vytvoríme URL parametre z nastavení
      const params = new URLSearchParams();
      Object.entries(settings).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const cacheKey = `youtube:${Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}:${value}`)
        .join(':')}`;

      try {
        // Skúsime najprv načítať z Redis cache
        const cachedData = await getCache(cacheKey);

        if (cachedData) {
          console.log('✅ Načítané z Redis cache:', cacheKey);
          setVideos(JSON.parse(cachedData));
          return;
        }

        console.log('⚠️ Cache miss, fetching from API:', cacheKey);

        const response = await fetch(`/api/videos?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Nepodarilo sa načítať videá');
        }

        const data = await response.json();

        if (
          !data.items ||
          !Array.isArray(data.items) ||
          data.items.length === 0
        ) {
          throw new Error('Neboli nájdené žiadne videá pre zadané kritériá.');
        }

        // Uložíme do Redis cache
        await setCache(cacheKey, JSON.stringify(data.items), 3600);

        setVideos(data.items);
      } catch (err) {
        console.error('❌ Chyba pri načítaní:', err);
        setError(err instanceof Error ? err.message : 'Vyskytla sa chyba');
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [settings]);

  return { videos, isLoading, error };
}
