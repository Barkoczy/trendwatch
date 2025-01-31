import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/libs/RedisClient';
import { trendingVideos, searchVideos } from '@/libs/YoutubeAPI';
import { defaultRegionCode } from '@/constants/regions';
import { isShortsVideo } from '@/utils/helpers';
import { generateCacheKey, getCacheTTL } from '@/utils/helpers';

const API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = {
    regionCode: searchParams.get('regionCode') || defaultRegionCode,
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
    // Optimalizovaný kľúč pre cache
    const cacheKey = generateCacheKey(params);

    // Získanie dát z Redis cache
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
        : data.items.filter((video) => !isShortsVideo(video));

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
      timestamp: Date.now(), // Pridané pre lepšie sledovanie čerstvosti dát
    };

    // Dynamické nastavenie TTL podľa typu požiadavky
    const cacheTTL = getCacheTTL(params);
    await setCache(cacheKey, JSON.stringify(responseData), cacheTTL);

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
