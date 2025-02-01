import type { Video } from '@/types/video';

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
