export const YOUTUBE_API = {
  BASE_URL: 'https://www.googleapis.com/youtube/v3',
  ENDPOINTS: {
    CHANNELS: '/channels',
    VIDEOS: '/videos',
    SEARCH: '/search',
  },
  CACHE_DURATION: 3600, // 1 hodina v sekundách
  MAX_RESULTS: {
    SEARCH: 50,
    RELATED: 15,
  },
};
