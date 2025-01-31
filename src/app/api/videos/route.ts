import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/libs/RedisClient';
const API_KEY = process.env.YOUTUBE_API_KEY;
const CACHE_TTL = 3600;

async function trendingVideos(regionCode: string, pageToken?: string) {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.append('part', 'snippet,contentDetails');
  url.searchParams.append('chart', 'mostPopular');
  url.searchParams.append('regionCode', regionCode);
  url.searchParams.append('maxResults', '50');
  url.searchParams.append('key', API_KEY!);
  if (pageToken) {
    url.searchParams.append('pageToken', pageToken);
  }
  console.log(url.searchParams.toString());
  const response = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new Error(`YouTube API responded with status: ${response.status}`);
  }
  return response.json();
}

async function searchVideos(params: {
  regionCode: string;
  maxResults: number;
  pageToken?: string;
  searchQuery?: string;
  order: string;
  safeSearch?: string;
  publishedAfter?: string;
  publishedBefore?: string;
}) {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('type', 'video');
  url.searchParams.append('regionCode', params.regionCode);
  url.searchParams.append('maxResults', params.maxResults.toString());
  url.searchParams.append('key', API_KEY!);
  if (params.pageToken) {
    url.searchParams.append('pageToken', params.pageToken);
  }
  if (params.searchQuery) {
    url.searchParams.append('q', params.searchQuery);
  }
  if (params.order) {
    url.searchParams.append(
      'order',
      params.order === 'mostPopular' ? 'viewCount' : params.order
    );
  }
  if (params.safeSearch) {
    url.searchParams.append('safeSearch', params.safeSearch);
  }
  if (params.publishedAfter) {
    url.searchParams.append('publishedAfter', params.publishedAfter);
  }
  if (params.publishedBefore) {
    url.searchParams.append('publishedBefore', params.publishedBefore);
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`YouTube API responded with status: ${response.status}`);
  }
  return response.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = {
    regionCode: searchParams.get('regionCode') || 'SK',
    maxResults: parseInt(searchParams.get('maxResults') || '12'),
    includeShorts: searchParams.get('includeShorts') === 'true',
    searchQuery: searchParams.get('searchQuery') || undefined,
    order: searchParams.get('order') || 'mostPopular',
    safeSearch: searchParams.get('safeSearch') || undefined,
    publishedAfter: searchParams.get('publishedAfter') || undefined,
    publishedBefore: searchParams.get('publishedBefore') || undefined,
  };

  if (!API_KEY) {
    return NextResponse.json(
      { error: 'YouTube API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const cacheKey = `youtube:${Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}:${value}`)
      .join(':')}`;

    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    let allVideos: Array<{
      contentDetails: { duration: string };
      snippet: { description: string; title: string };
    }> = [];
    let nextPageToken;
    let attempts = 0;
    const maxAttempts = 5;

    while (allVideos.length < params.maxResults && attempts < maxAttempts) {
      const data: {
        items: Array<{
          contentDetails: { duration: string };
          snippet: { description: string; title: string };
        }>;
        nextPageToken?: string;
      } =
        !params.searchQuery && params.order === 'mostPopular'
          ? await trendingVideos(params.regionCode, nextPageToken)
          : await searchVideos({ ...params, pageToken: nextPageToken });

      const filteredVideos = params.includeShorts
        ? data.items
        : data.items.filter(
            (video: {
              contentDetails: { duration: string };
              snippet: { description: string; title: string };
            }) => {
              try {
                const duration = video.contentDetails.duration;
                const match = duration.match(
                  /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
                );
                if (!match) return true;

                const hours = parseInt(match[1] || '0');
                const minutes = parseInt(match[2] || '0');
                const seconds = parseInt(match[3] || '0');
                const totalSeconds = hours * 3600 + minutes * 60 + seconds;

                const isShortsByMetadata =
                  video.snippet.description.toLowerCase().includes('#shorts') ||
                  video.snippet.title.toLowerCase().includes('#shorts') ||
                  totalSeconds <= 79;

                return !isShortsByMetadata;
              } catch (error) {
                console.error('Error parsing video duration:', error);
                return true;
              }
            }
          );

      allVideos = [...allVideos, ...filteredVideos];
      nextPageToken = data.nextPageToken;
      attempts++;

      if (!nextPageToken || allVideos.length >= params.maxResults) break;
    }

    const finalVideos = allVideos.slice(0, params.maxResults);

    const headers = new Headers({
      'X-Total-Videos-Found': allVideos.length.toString(),
      'X-Pages-Fetched': attempts.toString(),
      'X-Videos-Returned': finalVideos.length.toString(),
    });

    const responseData = {
      items: finalVideos,
      pageInfo: {
        totalResults: finalVideos.length,
        resultsPerPage: params.maxResults,
      },
      nextPageToken,
    };

    await setCache(cacheKey, JSON.stringify(responseData), CACHE_TTL);
    return NextResponse.json(responseData, { headers });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch videos from YouTube',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
