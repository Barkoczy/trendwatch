// Funkcia na detekciu Shorts videí
export const isShortsVideo = (video: {
  contentDetails: { duration: string };
  snippet: { description: string; title: string };
}): boolean => {
  const duration = video.contentDetails.duration;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return false;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  const isShortsByMetadata =
    video.snippet.description.toLowerCase().includes('#shorts') ||
    video.snippet.title.toLowerCase().includes('#shorts') ||
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
    return `${(views / 1_000_000).toFixed(1).replace('.', ',')} mil.`;
  }
  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1).replace('.', ',')} tis.`;
  }
  return views.toString();
};
