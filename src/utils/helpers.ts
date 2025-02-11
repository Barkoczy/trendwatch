import type { Video } from '@/types/video';
import type {
  HistoryEntry,
  HistoryPeriod,
  GroupedHistory,
} from '@/types/history';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';

// Funkcia na detekciu Shorts videí
export const isShortsVideo = (video: Video): boolean => {
  const duration = video.contentDetails?.duration || '';
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return false;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  // Kontrolujeme #shorts v title a description, ktoré sú teraz v root objektu
  const isShortsByMetadata =
    video.description.toLowerCase().includes('#shorts') ||
    video.title.toLowerCase().includes('#shorts') ||
    totalSeconds <= 79;

  return isShortsByMetadata;
};

// Pomocné funkcie pre lepšiu organizáciu a čistejší kód
export const generateCacheKey = (
  params: Record<string, string | number | boolean | undefined>
): string => {
  const relevantParams = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}:${value}`);

  // Pridanie časovej zóny pre lepšiu granularitu cache
  const timeZone = new Date().getTimezoneOffset();
  return `youtube:${timeZone}:${relevantParams.join(':')}`;
};

const CACHE_TTL = {
  TRENDING: 900, // 15 minút pre trending videá
  SEARCH: 1800, // 30 minút pre výsledky vyhľadávania
  POPULAR: 1200, // 20 minút pre populárne videá
};

export const getCacheTTL = (
  params: Record<string, string | number | boolean | undefined>
): number => {
  if (params.searchQuery) {
    return CACHE_TTL.SEARCH;
  }

  if (params.order === 'mostPopular') {
    return CACHE_TTL.POPULAR;
  }

  return CACHE_TTL.TRENDING;
};

// Formátovanie počtu zobrazení
export const formatViews = (views: number) => {
  if (views >= 1_000_000) {
    const millions = Math.round(views / 100_000) / 10;
    // Odstráni desatinnú čiarku ak je číslo celé
    const formatted =
      millions % 1 === 0
        ? millions.toString()
        : millions.toString().replace('.', '.');
    return `${formatted}M`;
  }

  if (views >= 1_000) {
    const thousands = Math.round(views / 100) / 10;
    const formatted =
      thousands % 1 === 0
        ? thousands.toString()
        : thousands.toString().replace('.', '.');
    return `${formatted}K`;
  }

  return views.toString();
};

// Formátovanie dĺžky videa
export const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  if (!match) return '0:00';

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  const h = hours ? `${hours}:` : '';
  const m = minutes ? `${minutes.padStart(2, '0')}:` : '00:';
  const s = seconds ? seconds.padStart(2, '0') : '00';

  if (!hours && !minutes && !seconds) return '0:00';

  return `${h}${m}${s}`;
};

// Formátovanie dátumu
export const formatDate = (dateString: string) => {
  return formatDistanceToNow(new Date(dateString), {
    locale: sk,
    addSuffix: false,
  });
};

// Helper funkcia na kontrolu či je dátum v aktuálnom týždni
export const isThisWeek = (date: Date): boolean => {
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
  return date >= weekStart && date <= weekEnd;
};

// Funkcia na zoskupenie histórie podľa dátumu
export const groupHistoryByPeriod = (
  history: HistoryEntry[]
): GroupedHistory => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const periods: HistoryPeriod[] = ['Dnes', 'Včera', 'Tento týždeň', 'Staršie'];
  const initialGroups = periods.reduce((acc, period) => {
    acc[period] = [];
    return acc;
  }, {} as GroupedHistory);

  return history.reduce((grouped, entry) => {
    const watchDate = new Date(entry.watchedAt);

    let period: HistoryPeriod;
    if (watchDate.toDateString() === today.toDateString()) {
      period = 'Dnes';
    } else if (watchDate.toDateString() === yesterday.toDateString()) {
      period = 'Včera';
    } else if (isThisWeek(watchDate)) {
      period = 'Tento týždeň';
    } else {
      period = 'Staršie';
    }

    grouped[period].push(entry);
    return grouped;
  }, initialGroups);
};
