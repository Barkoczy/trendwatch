import { setCache, getCache } from '@/libs/RedisClient';
import { Video } from '@/types/video';

const API_KEY = process.env.YOUTUBE_API_KEY;
const CACHE_DURATION = 3600; // 1 hodina v sekundách

async function getChannelThumbnail(channelId: string): Promise<string> {
  const cacheKey = `channel_thumbnail:${channelId}`;
  const cachedThumbnail = await getCache(cacheKey);
  if (cachedThumbnail) return cachedThumbnail;

  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('id', channelId);
  url.searchParams.append('key', API_KEY!);

  const response = await fetch(url.toString(), {
    next: { revalidate: CACHE_DURATION },
  });
  if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);

  const data = await response.json();
  const thumbnailUrl = data.items[0]?.snippet?.thumbnails?.default?.url || '';
  if (thumbnailUrl) {
    // Thumbnail URLs sa menia zriedka, môžeme cachovať dlhšie
    await setCache(cacheKey, thumbnailUrl, CACHE_DURATION * 2);
  }
  return thumbnailUrl;
}

async function fetchVideosDetails(videoIds: string[]): Promise<Video[]> {
  // Cache pre detaily videí
  const cacheKey = `videos_details:${videoIds.join(',')}`;
  const cachedDetails = await getCache(cacheKey);
  if (cachedDetails) return JSON.parse(cachedDetails);

  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.append('part', 'snippet,contentDetails,statistics');
  url.searchParams.append('id', videoIds.join(','));
  url.searchParams.append('key', API_KEY!);

  const response = await fetch(url.toString(), {
    next: { revalidate: CACHE_DURATION },
  });
  if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
  const data = await response.json();

  const videos = await Promise.all(
    data.items.map(
      async (video: {
        id: string;
        snippet: { channelId: string };
        contentDetails: {
          duration: string;
          dimension: string;
          definition: string;
          caption: string;
          licensedContent: boolean;
          projection: string;
        };
        statistics: {
          viewCount: string;
          likeCount: string;
          dislikeCount: string;
          favoriteCount: string;
          commentCount: string;
        };
      }) => ({
        id: video.id,
        snippet: {
          ...video.snippet,
          channelThumbnail: await getChannelThumbnail(video.snippet.channelId),
        },
        contentDetails: video.contentDetails,
        statistics: video.statistics,
      })
    )
  );

  // Cache detaily videí na kratší čas, keďže sa často menia
  await setCache(cacheKey, JSON.stringify(videos), CACHE_DURATION / 2);
  return videos;
}

export async function trendingVideos(regionCode: string, pageToken?: string) {
  const cacheKey = `trending:${regionCode}:${pageToken || 'initial'}`;
  const cachedTrending = await getCache(cacheKey);
  if (cachedTrending) return JSON.parse(cachedTrending);

  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('chart', 'mostPopular');
  url.searchParams.append('regionCode', regionCode);
  url.searchParams.append('maxResults', '50');
  url.searchParams.append('key', API_KEY!);
  if (pageToken) url.searchParams.append('pageToken', pageToken);

  const response = await fetch(url.toString(), {
    next: { revalidate: CACHE_DURATION },
  });
  if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
  const data = await response.json();

  const result = {
    ...data,
    items: await fetchVideosDetails(
      data.items.map((video: { id: string }) => video.id)
    ),
  };

  // Trending videá sa menia často, cachujeme na kratší čas
  await setCache(cacheKey, JSON.stringify(result), CACHE_DURATION / 4);
  return result;
}

export async function searchVideos(params: {
  regionCode: string;
  maxResults: number;
  pageToken?: string;
  searchQuery?: string;
  order: string;
  safeSearch?: string;
  publishedAfter?: string;
  publishedBefore?: string;
}) {
  const cacheKey = `search:${JSON.stringify(params)}`;
  const cachedSearch = await getCache(cacheKey);
  if (cachedSearch) return JSON.parse(cachedSearch);

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('type', 'video');
  url.searchParams.append('regionCode', params.regionCode);
  url.searchParams.append('maxResults', params.maxResults.toString());
  url.searchParams.append('key', API_KEY!);
  if (params.pageToken) url.searchParams.append('pageToken', params.pageToken);
  if (params.searchQuery) url.searchParams.append('q', params.searchQuery);
  if (params.order)
    url.searchParams.append(
      'order',
      params.order === 'mostPopular' ? 'viewCount' : params.order
    );
  if (params.safeSearch)
    url.searchParams.append('safeSearch', params.safeSearch);
  if (params.publishedAfter)
    url.searchParams.append('publishedAfter', params.publishedAfter);
  if (params.publishedBefore)
    url.searchParams.append('publishedBefore', params.publishedBefore);

  const response = await fetch(url.toString(), {
    next: { revalidate: CACHE_DURATION },
  });
  if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
  const data = await response.json();

  const result = {
    ...data,
    items: await fetchVideosDetails(
      data.items.map((video: { id: { videoId: string } }) => video.id.videoId)
    ),
  };

  // Výsledky vyhľadávania cachujeme na stredne dlhý čas
  await setCache(cacheKey, JSON.stringify(result), CACHE_DURATION / 2);
  return result;
}
