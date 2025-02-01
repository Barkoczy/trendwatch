import { NextResponse } from 'next/server';
import { relatedVideos } from '@/libs/YouTubeAPI';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json(
      { error: 'Chýba parameter videoId' },
      { status: 400 }
    );
  }

  try {
    const videos = await relatedVideos(videoId);
    return NextResponse.json({ items: videos });
  } catch (error) {
    console.error('Chyba pri získavaní súvisiacich videí:', error);
    return NextResponse.json(
      { error: 'Nepodarilo sa získať súvisiace videá' },
      { status: 500 }
    );
  }
}
