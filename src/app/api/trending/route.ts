import { NextResponse } from 'next/server';

const API_KEY = process.env.YOUTUBE_API_KEY;

async function fetchVideosPage(regionCode: string, pageToken?: string) {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.append('part', 'snippet,contentDetails');
  url.searchParams.append('chart', 'mostPopular');
  url.searchParams.append('regionCode', regionCode);
  url.searchParams.append('maxResults', '50'); // Maximum povolené YouTube API
  url.searchParams.append('key', API_KEY!);
  if (pageToken) {
    url.searchParams.append('pageToken', pageToken);
  }

  const response = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new Error(`YouTube API responded with status: ${response.status}`);
  }
  return response.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const regionCode = searchParams.get('regionCode') || 'SK';
  const maxResults = parseInt(searchParams.get('maxResults') || '12');
  const includeShorts = searchParams.get('includeShorts') === 'true';

  if (!API_KEY) {
    return NextResponse.json(
      { error: 'YouTube API key is not configured' },
      { status: 500 }
    );
  }

  try {
    let allVideos: {
      snippet: {
        title: string;
        description: string;
        thumbnails: {
          [key: string]: { url: string; width: number; height: number };
        };
      };
      contentDetails: { duration: string };
    }[] = [];
    let nextPageToken: string | undefined;
    let attempts = 0;
    const maxAttempts = 5; // Obmedzenie počtu pokusov pre prevenciu nekonečnej slučky

    // Pokračujeme v načítavaní, kým nemáme dostatok videí alebo nedosiahli limit pokusov
    while (allVideos.length < maxResults && attempts < maxAttempts) {
      const data = await fetchVideosPage(regionCode, nextPageToken);

      // Filtrovanie videí
      const filteredVideos = includeShorts
        ? data.items
        : data.items.filter(
            (video: {
              contentDetails: { duration: string };
              snippet: { description: string; title: string };
            }) => {
              try {
                // 1. Kontrola dĺžky videa
                const duration = video.contentDetails.duration;
                const match = duration.match(
                  /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
                );
                if (!match) {
                  return true;
                }
                const hours = parseInt(match[1] || '0');
                const minutes = parseInt(match[2] || '0');
                const seconds = parseInt(match[3] || '0');
                const totalSeconds = hours * 3600 + minutes * 60 + seconds;

                // 2. Kontrola popisu a názvu
                const isShortsByMetadata =
                  video.snippet.description.toLowerCase().includes('#shorts') ||
                  video.snippet.title.toLowerCase().includes('#shorts') ||
                  totalSeconds <= 69; // Zvýšená hranica na 61 sekúnd pre istotu

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

      // Ak nemáme ďalšiu stránku alebo máme dostatok videí, končíme
      if (!nextPageToken || allVideos.length >= maxResults) break;
    }

    // Orezanie na požadovaný počet
    const finalVideos = allVideos.slice(0, maxResults);

    // Pridanie debugovacích informácií do response headers
    const headers = new Headers({
      'X-Total-Videos-Found': allVideos.length.toString(),
      'X-Pages-Fetched': attempts.toString(),
      'X-Videos-Returned': finalVideos.length.toString(),
    });

    return NextResponse.json(
      {
        items: finalVideos,
        pageInfo: {
          totalResults: finalVideos.length,
          resultsPerPage: maxResults,
        },
      },
      { headers }
    );
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
