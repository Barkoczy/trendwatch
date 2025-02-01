import { setCache, getCache } from '@/libs/RedisClient';
import { Video } from '@/types/video';

const API_KEY = process.env.YOUTUBE_API_KEY;
const CACHE_DURATION = 3600; // 1 hodina v sekundách

async function getChannelDetails(
  channelId: string
): Promise<{ title: string; thumbnail: string }> {
  const cacheKey = `channel_details:${channelId}`;
  const cachedDetails = await getCache(cacheKey);
  if (cachedDetails) return JSON.parse(cachedDetails);

  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('id', channelId);
  url.searchParams.append('key', API_KEY!);

  const response = await fetch(url.toString(), {
    next: { revalidate: CACHE_DURATION },
  });
  if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);

  const data = await response.json();
  const channel = {
    title: data.items[0]?.snippet?.title || '',
    thumbnail: data.items[0]?.snippet?.thumbnails?.default?.url || '',
  };

  await setCache(cacheKey, JSON.stringify(channel), CACHE_DURATION * 2);
  return channel;
}

async function normalizeVideoData(rawVideo: {
  id: string | { videoId: string };
  snippet: {
    channelId: string;
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
      standard?: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    tags?: string[];
    categoryId?: string;
    liveBroadcastContent?: string;
    defaultLanguage?: string;
    defaultAudioLanguage?: string;
  };
  contentDetails?: {
    duration?: string;
    dimension?: string;
    definition?: string;
    caption?: string;
    licensedContent?: boolean;
    regionRestriction?: {
      allowed?: string[];
      blocked?: string[];
    };
    projection?: string;
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    dislikeCount?: string;
    favoriteCount?: string;
    commentCount?: string;
  };
}): Promise<Video> {
  const channelDetails = await getChannelDetails(rawVideo.snippet.channelId);

  return {
    id: typeof rawVideo.id === 'string' ? rawVideo.id : rawVideo.id.videoId,
    title: rawVideo.snippet.title,
    description: rawVideo.snippet.description,
    publishedAt: rawVideo.snippet.publishedAt,
    thumbnails: {
      default: rawVideo.snippet.thumbnails.default,
      medium: rawVideo.snippet.thumbnails.medium || {
        url: '',
        width: 0,
        height: 0,
      },
      high: rawVideo.snippet.thumbnails.high || {
        url: '',
        width: 0,
        height: 0,
      },
      standard: rawVideo.snippet.thumbnails.standard,
      maxres: rawVideo.snippet.thumbnails.maxres,
    },
    tags: rawVideo.snippet.tags || [],
    categoryId: rawVideo.snippet.categoryId || '',
    liveBroadcastContent: rawVideo.snippet.liveBroadcastContent || 'none',
    defaultLanguage: rawVideo.snippet.defaultLanguage,
    defaultAudioLanguage: rawVideo.snippet.defaultAudioLanguage || '',
    channel: {
      id: rawVideo.snippet.channelId,
      title: channelDetails.title,
      thumbnail: channelDetails.thumbnail,
    },
    contentDetails: {
      duration: rawVideo.contentDetails?.duration || 'PT0S',
      dimension: rawVideo.contentDetails?.dimension || '2d',
      definition: rawVideo.contentDetails?.definition || 'hd',
      caption: rawVideo.contentDetails?.caption || 'false',
      licensedContent: rawVideo.contentDetails?.licensedContent || false,
      regionRestriction: rawVideo.contentDetails?.regionRestriction,
      projection: rawVideo.contentDetails?.projection || 'rectangular',
    },
    statistics: {
      viewCount: rawVideo.statistics?.viewCount || '0',
      likeCount: rawVideo.statistics?.likeCount || '0',
      dislikeCount: rawVideo.statistics?.dislikeCount || '0',
      favoriteCount: rawVideo.statistics?.favoriteCount || '0',
      commentCount: rawVideo.statistics?.commentCount || '0',
    },
  };
}

async function fetchVideosDetails(videoIds: string[]): Promise<Video[]> {
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
      (video: {
        id: string | { videoId: string };
        snippet: {
          channelId: string;
          title: string;
          description: string;
          publishedAt: string;
          thumbnails: {
            default: { url: string; width: number; height: number };
            medium?: { url: string; width: number; height: number };
            high?: { url: string; width: number; height: number };
            standard?: { url: string; width: number; height: number };
            maxres?: { url: string; width: number; height: number };
          };
          tags?: string[];
          categoryId?: string;
          liveBroadcastContent?: string;
          defaultLanguage?: string;
          defaultAudioLanguage?: string;
        };
        contentDetails?: {
          duration?: string;
          dimension?: string;
          definition?: string;
          caption?: string;
          licensedContent?: boolean;
          regionRestriction?: {
            allowed?: string[];
            blocked?: string[];
          };
          projection?: string;
        };
        statistics?: {
          viewCount?: string;
          likeCount?: string;
          dislikeCount?: string;
          favoriteCount?: string;
          commentCount?: string;
        };
      }) => normalizeVideoData(video)
    )
  );

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

  const videos = await fetchVideosDetails(
    data.items.map((video: { id: string }) => video.id)
  );

  const result = {
    ...data,
    items: videos,
  };

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

  const videos = await fetchVideosDetails(
    data.items.map((video: { id: { videoId: string } }) => video.id.videoId)
  );

  const result = {
    ...data,
    items: videos,
  };

  await setCache(cacheKey, JSON.stringify(result), CACHE_DURATION / 2);
  return result;
}
