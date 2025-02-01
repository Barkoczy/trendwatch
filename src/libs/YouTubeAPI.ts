import { setCache, getCache } from '@/libs/RedisClient';
import { YOUTUBE_API } from '@/constants/youtube';
import type {
  Video,
  RawVideo,
  VideoSnippet,
  SearchParams,
} from '@/types/youtube';

const API_KEY = process.env.YOUTUBE_API_KEY;

function buildSearchQuery(snippet: VideoSnippet): string {
  function cleanWords(text: string): string[] {
    return text
      .toLowerCase() // Convert to lowercase first
      .replace(/[^\w\sÀ-ž]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2);
  }

  const relevantTags = (snippet.tags || [])
    .map((tag) => tag.toLowerCase()) // Convert tags to lowercase
    .filter((tag) => tag.length > 2)
    .slice(0, 3);

  const titleWords = cleanWords(snippet.title).slice(0, 2);
  const descriptionWords = snippet.description
    ? cleanWords(snippet.description.split('.')[0]).slice(0, 1)
    : [];

  // Using Set already handles uniqueness, but now all input is lowercase
  const allRelevantWords = Array.from(
    new Set([...relevantTags, ...titleWords, ...descriptionWords])
  );

  const searchTerms = allRelevantWords.slice(0, 4).join('|');
  return searchTerms;
}

async function getChannelDetails(
  channelId: string
): Promise<{ title: string; thumbnail: string }> {
  const cacheKey = `channel_details:${channelId}`;
  const cachedDetails = await getCache(cacheKey);
  if (cachedDetails) return JSON.parse(cachedDetails);

  const url = new URL(
    `${YOUTUBE_API.BASE_URL}${YOUTUBE_API.ENDPOINTS.CHANNELS}`
  );
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('id', channelId);
  url.searchParams.append('key', API_KEY!);

  const response = await fetch(url.toString(), {
    next: { revalidate: YOUTUBE_API.CACHE_DURATION },
  });
  if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);

  const data = await response.json();
  const channel = {
    title: data.items[0]?.snippet?.title || '',
    thumbnail: data.items[0]?.snippet?.thumbnails?.default?.url || '',
  };

  await setCache(
    cacheKey,
    JSON.stringify(channel),
    YOUTUBE_API.CACHE_DURATION * 2
  );
  return channel;
}

async function normalizeVideoData(rawVideo: RawVideo): Promise<Video> {
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

export async function videosDetails(videoIds: string[]): Promise<Video[]> {
  const cacheKey = `videos_details:${videoIds.join(',')}`;
  const cachedDetails = await getCache(cacheKey);
  if (cachedDetails) return JSON.parse(cachedDetails);

  const url = new URL(`${YOUTUBE_API.BASE_URL}${YOUTUBE_API.ENDPOINTS.VIDEOS}`);
  url.searchParams.append('part', 'snippet,contentDetails,statistics');
  url.searchParams.append('id', videoIds.join(','));
  url.searchParams.append('key', API_KEY!);

  const response = await fetch(url.toString(), {
    next: { revalidate: YOUTUBE_API.CACHE_DURATION },
  });
  if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
  const data = await response.json();

  const videos = await Promise.all(
    data.items.map((video: RawVideo) => normalizeVideoData(video))
  );

  await setCache(
    cacheKey,
    JSON.stringify(videos),
    YOUTUBE_API.CACHE_DURATION / 2
  );
  return videos;
}

export async function trendingVideos(regionCode: string, pageToken?: string) {
  const cacheKey = `trending:${regionCode}:${pageToken || 'initial'}`;
  const cachedTrending = await getCache(cacheKey);
  if (cachedTrending) return JSON.parse(cachedTrending);

  const url = new URL(`${YOUTUBE_API.BASE_URL}${YOUTUBE_API.ENDPOINTS.VIDEOS}`);
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('chart', 'mostPopular');
  url.searchParams.append('regionCode', regionCode);
  url.searchParams.append(
    'maxResults',
    YOUTUBE_API.MAX_RESULTS.SEARCH.toString()
  );
  url.searchParams.append('key', API_KEY!);
  if (pageToken) url.searchParams.append('pageToken', pageToken);

  const response = await fetch(url.toString(), {
    next: { revalidate: YOUTUBE_API.CACHE_DURATION },
  });
  if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
  const data = await response.json();

  const videos = await videosDetails(
    data.items.map((video: { id: string }) => video.id)
  );

  const result = {
    ...data,
    items: videos,
  };

  await setCache(
    cacheKey,
    JSON.stringify(result),
    YOUTUBE_API.CACHE_DURATION / 4
  );
  return result;
}

export async function searchVideos(params: SearchParams) {
  const cacheKey = `search:${JSON.stringify(params)}`;
  const cachedSearch = await getCache(cacheKey);
  if (cachedSearch) return JSON.parse(cachedSearch);

  const url = new URL(`${YOUTUBE_API.BASE_URL}${YOUTUBE_API.ENDPOINTS.SEARCH}`);
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('type', 'video');
  url.searchParams.append('regionCode', params.regionCode);
  url.searchParams.append('maxResults', params.maxResults.toString());
  url.searchParams.append('key', API_KEY!);

  if (params.pageToken) url.searchParams.append('pageToken', params.pageToken);
  if (params.searchQuery) url.searchParams.append('q', params.searchQuery);
  if (params.order) {
    url.searchParams.append(
      'order',
      params.order === 'mostPopular' ? 'viewCount' : params.order
    );
  }
  if (params.safeSearch)
    url.searchParams.append('safeSearch', params.safeSearch);
  if (params.publishedAfter)
    url.searchParams.append('publishedAfter', params.publishedAfter);
  if (params.publishedBefore)
    url.searchParams.append('publishedBefore', params.publishedBefore);

  const response = await fetch(url.toString(), {
    next: { revalidate: YOUTUBE_API.CACHE_DURATION },
  });
  if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
  const data = await response.json();

  const videos = await videosDetails(
    data.items.map((video: { id: { videoId: string } }) => video.id.videoId)
  );

  const result = {
    ...data,
    items: videos,
  };

  await setCache(
    cacheKey,
    JSON.stringify(result),
    YOUTUBE_API.CACHE_DURATION / 2
  );
  return result;
}

export async function relatedVideos(videoId: string): Promise<Video[]> {
  const cacheKey = `related:${videoId}`;
  const cachedRelated = await getCache(cacheKey);
  if (cachedRelated) return JSON.parse(cachedRelated);

  const videoDetailsUrl = new URL(
    `${YOUTUBE_API.BASE_URL}${YOUTUBE_API.ENDPOINTS.VIDEOS}`
  );
  videoDetailsUrl.searchParams.append('part', 'snippet');
  videoDetailsUrl.searchParams.append('id', videoId);
  videoDetailsUrl.searchParams.append('key', API_KEY!);

  const videoResponse = await fetch(videoDetailsUrl.toString());
  const videoData = await videoResponse.json();

  if (!videoResponse.ok || !videoData.items?.[0]) {
    throw new Error(`Failed to get video details: ${videoResponse.status}`);
  }

  const video = videoData.items[0];
  const searchTerms = buildSearchQuery(video.snippet);

  const searchUrl = new URL(
    `${YOUTUBE_API.BASE_URL}${YOUTUBE_API.ENDPOINTS.SEARCH}`
  );
  searchUrl.searchParams.append('part', 'snippet');
  searchUrl.searchParams.append('type', 'video');
  searchUrl.searchParams.append(
    'maxResults',
    YOUTUBE_API.MAX_RESULTS.RELATED.toString()
  );
  if (video.snippet.categoryId) {
    searchUrl.searchParams.append('videoCategoryId', video.snippet.categoryId);
  }
  searchUrl.searchParams.append('q', searchTerms);
  searchUrl.searchParams.append('key', API_KEY!);

  const response = await fetch(searchUrl.toString(), {
    next: { revalidate: YOUTUBE_API.CACHE_DURATION },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('YouTube API Error:', errorData);
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.items?.length) {
    return [];
  }

  const videoIds = data.items
    .map((item: { id: { videoId: string } }) => item.id.videoId)
    .filter((id: string) => id !== videoId);

  const normalizedVideos = await videosDetails(videoIds);

  await setCache(
    cacheKey,
    JSON.stringify(normalizedVideos),
    YOUTUBE_API.CACHE_DURATION / 2
  );

  return normalizedVideos;
}
