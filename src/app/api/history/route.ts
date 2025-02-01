import { NextResponse } from 'next/server';
import { getWatchHistory, addToWatchHistory } from '@/libs/WatchHistory';
import type { Video } from '@/types/video';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('pageSize') || '50';

  try {
    const result = await getWatchHistory(Number(page), Number(pageSize));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Chyba pri načítaní histórie:', error);
    return NextResponse.json(
      { message: 'Interná chyba servera' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const video: Video = body.video;

    if (!video) {
      return NextResponse.json(
        { message: 'Chýbajúce údaje o videu' },
        { status: 400 }
      );
    }

    await addToWatchHistory(video);
    return NextResponse.json({ message: 'Video pridané do histórie' });
  } catch (error) {
    console.error('Chyba pri pridávaní videa do histórie:', error);
    return NextResponse.json(
      { message: 'Interná chyba servera' },
      { status: 500 }
    );
  }
}
