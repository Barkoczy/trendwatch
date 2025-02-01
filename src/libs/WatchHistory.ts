import type { Video } from '@/types/video';
import { getCache, setCache } from '@/libs/RedisClient';

const HISTORY_KEY = 'watch_history';
const MAX_HISTORY_ITEMS = 500;
const CACHE_EXPIRY = 60 * 60 * 24 * 30;
const MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;

interface WatchHistoryEntry {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  channelId: string;
  watchedAt: string;
  publishedAt: string;
}

export async function addToWatchHistory(video: Video): Promise<void> {
  try {
    const existingHistory = await getCache(HISTORY_KEY);
    let history: WatchHistoryEntry[] = existingHistory
      ? JSON.parse(existingHistory)
      : [];

    const now = new Date();
    const monthAgo = new Date(now.getTime() - MONTH_IN_MS);

    // Vyčistíme záznamy staršie ako mesiac
    history = history.filter((entry) => new Date(entry.watchedAt) > monthAgo);

    const newEntry: WatchHistoryEntry = {
      videoId: video.id,
      title: video.title,
      thumbnailUrl: video.thumbnails.high.url,
      channelTitle: video.channel.title,
      channelId: video.channel.id,
      watchedAt: now.toISOString(),
      publishedAt: video.publishedAt,
    };

    const existingIndex = history.findIndex(
      (entry) => entry.videoId === video.id
    );

    if (existingIndex !== -1) {
      // Aktualizácia existujúceho záznamu
      history[existingIndex].watchedAt = newEntry.watchedAt;
      const [entry] = history.splice(existingIndex, 1);
      history.unshift(entry);
    } else {
      // Pridanie nového záznamu
      history.unshift(newEntry);
      if (history.length > MAX_HISTORY_ITEMS) {
        history = history.slice(0, MAX_HISTORY_ITEMS);
      }
    }

    // Uložíme s mesačnou expiráciou
    await setCache(HISTORY_KEY, JSON.stringify(history), CACHE_EXPIRY);
  } catch (error) {
    console.error('Chyba pri pridávaní do histórie:', error);
  }
}

export async function getWatchHistory(
  page: number = 1,
  pageSize: number = 50
): Promise<{ items: WatchHistoryEntry[]; hasMore: boolean }> {
  try {
    const history = await getCache(HISTORY_KEY);
    const parsedHistory = history ? JSON.parse(history) : [];

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = parsedHistory.slice(start, end);

    // Zistime či existujú ďalšie záznamy
    const hasMore = parsedHistory.length > end;

    return { items, hasMore };
  } catch (error) {
    console.error('Chyba pri získavaní histórie:', error);
    return { items: [], hasMore: false };
  }
}
