// app/api/video/[videoId]/route.ts
import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/libs/RedisClient';
import { videosDetails } from '@/libs/YouTubeAPI';

const CACHE_DURATION = 3600;

export async function GET(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  // Safely await params
  const { videoId } = await params;

  if (!process.env.YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: 'YouTube API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const cacheKey = `video:${videoId}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    const videos = await videosDetails([videoId]);

    if (!videos.length) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const video = videos[0];

    const responseData = {
      item: video,
      timestamp: Date.now(),
    };

    // Cache na 1 hodinu
    await setCache(cacheKey, JSON.stringify(responseData), CACHE_DURATION);

    const headers = new Headers({
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'Content-Type': 'application/json',
    });

    return NextResponse.json(responseData, { headers });
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch video from YouTube',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
