import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';
import axios from 'axios';
import { setCache, getCache } from '@/libs/RedisClient';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/videoCategories';

// Alternatívna cache (použitá, ak Redis nie je k dispozícii)
const memoryCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // TTL 1 hodina

type VideoCategory = {
  id: string;
  snippet: {
    title: string;
    assignable: boolean;
    channelId: string;
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const regionCode = searchParams.get('regionCode') || 'US'; // Default regionCode
  const part = 'snippet';

  // Kľúč pre cache
  const cacheKey = `videoCategories:${regionCode}`;

  // Skúsime načítať dáta z cache
  let cachedData: VideoCategory[] | null = null;

  // 1. Skontrolujeme Redis cache
  const redisData = await getCache(cacheKey);
  if (redisData) {
    cachedData = JSON.parse(redisData);
  }

  // 2. Ak Redis nie je k dispozícii, skontrolujeme pamäťovú cache
  if (!cachedData) {
    const memoryData = memoryCache.get<VideoCategory[]>(cacheKey);
    if (memoryData) {
      cachedData = memoryData;
    }
  }

  // Ak máme dáta v cache, vrátime ich
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  // Ak nie sú dáta v cache, zavoláme YouTube API
  try {
    const params = {
      part,
      key: YOUTUBE_API_KEY,
      regionCode,
    };

    const response = await axios.get(YOUTUBE_API_URL, { params });

    const categories = response.data.items.map((item: VideoCategory) => ({
      id: item.id,
      title: item.snippet.title,
      regionCode,
    }));

    // Uložíme dáta do Redis cache na 1 hodinu
    await setCache(cacheKey, JSON.stringify(categories), 3600);

    // Uložíme dáta do pamäťovej cache na 1 hodinu (ak Redis nie je k dispozícii)
    memoryCache.set(cacheKey, categories);

    return NextResponse.json(categories);
  } catch (error) {
    console.error('YouTube API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
