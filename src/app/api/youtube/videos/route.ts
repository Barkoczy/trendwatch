import { NextResponse } from 'next/server';
import axios from 'axios';
import { setCache, getCache } from '@/libs/RedisClient';
import { Video } from '@/types/video';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/videos';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const part = searchParams.get('part') || 'snippet,contentDetails,statistics';
  const id = searchParams.get('id');
  const chart = searchParams.get('chart');
  const maxResults = searchParams.get('maxResults') || '12';
  const pageToken = searchParams.get('pageToken');
  const regionCode = searchParams.get('regionCode');
  const videoCategoryId = searchParams.get('videoCategoryId');
  const hl = searchParams.get('hl');
  const includeShorts = searchParams.get('includeShorts') || 'false';

  const cacheKey = `videos:${JSON.stringify({
    part,
    id,
    chart,
    maxResults,
    pageToken,
    regionCode,
    videoCategoryId,
    hl,
    includeShorts,
  })}`;

  // Check Redis cache
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    return NextResponse.json(JSON.parse(cachedData));
  }

  // If not in cache, call YouTube API
  try {
    let videos: Video[] = [];
    let nextPageToken = pageToken || undefined;
    let totalResults = 0;

    while (videos.length < Number(maxResults)) {
      const params: {
        part: string;
        key: string | undefined;
        maxResults: number;
        pageToken?: string;
        id?: string;
        chart?: string;
        regionCode?: string;
        videoCategoryId?: string;
        hl?: string;
      } = {
        part,
        key: YOUTUBE_API_KEY,
        maxResults: Math.min(Number(maxResults) - videos.length, 50),
        pageToken: nextPageToken,
      };

      if (id) params.id = id;
      if (chart) params.chart = chart;
      if (regionCode) params.regionCode = regionCode;
      if (videoCategoryId) params.videoCategoryId = videoCategoryId;
      if (hl) params.hl = hl;

      const response = await axios.get(YOUTUBE_API_URL, { params });
      const items = response.data.items.filter((item: Video) => {
        if (includeShorts === 'true') return true;
        return !item.contentDetails.duration.match(/^PT0H0M\d+S$/); // Exclude Shorts
      });

      videos = videos.concat(items);
      totalResults = response.data.pageInfo.totalResults;
      nextPageToken = response.data.nextPageToken;

      if (!nextPageToken) break; // No more pages
    }

    const result = {
      items: videos.slice(0, Number(maxResults)),
      nextPageToken,
      totalResults,
    };

    // Save data to Redis cache for 1 hour
    await setCache(cacheKey, JSON.stringify(result), 3600);

    return NextResponse.json(result);
  } catch (error) {
    console.error('YouTube API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
