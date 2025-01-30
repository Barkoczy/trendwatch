import { useState, useEffect } from 'react';
import { getCache, setCache } from '@/libs/RedisClient';

interface Video {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    channelTitle: string;
  };
}

interface UseYouTubeTrendingProps {
  regionCode: string;
  maxResults: number;
  includeShorts: boolean;
}

export function useYouTubeTrending({
  regionCode,
  maxResults,
  includeShorts,
}: UseYouTubeTrendingProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);

      const cacheKey = `youtube:trending:${regionCode}:${maxResults}:${includeShorts}`;
      let cachedData: string | null = null;

      try {
        // 🛠 Skúsime najskôr načítať z Redis cache
        cachedData = await getCache(cacheKey);

        if (!cachedData) {
          console.warn(
            '⚠️ Redis nie je dostupný alebo cache neexistuje, volám API...'
          );

          // 🛠 Zavoláme API priamo, ak Redis nefunguje alebo cache chýba
          const response = await fetch(
            `/api/trending?regionCode=${regionCode}&maxResults=${maxResults}&includeShorts=${includeShorts}`,
            { next: { revalidate: 3600 } } // Cacheujeme odpoveď na 1 hodinu
          );

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
            throw new Error('Neboli nájdené žiadne videá pre zvolený región.');
          }

          cachedData = JSON.stringify(data.items);

          // 🛠 Ak Redis funguje, uložíme tam dáta
          await setCache(cacheKey, cachedData, 3600);
        }

        setVideos(JSON.parse(cachedData));
      } catch (err) {
        console.error('❌ Chyba pri načítaní:', err);
        setError(err instanceof Error ? err.message : 'Vyskytla sa chyba');
        setVideos([]); // Zabezpečíme, že sa nezobrazí starý obsah
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [regionCode, maxResults, includeShorts]);

  return { videos, isLoading, error };
}
