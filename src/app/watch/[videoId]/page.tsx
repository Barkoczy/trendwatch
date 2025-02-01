import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import VideoInfo from '@/components/VideoInfo';
import RelatedVideosSidebar from '@/components/RelatedVideosSidebar';
import type { Video } from '@/types/video';

interface Props {
  params: {
    videoId: string;
  };
}

async function fetchVideoData(videoId: string): Promise<Video | null> {
  try {
    // Použijeme absolútnu URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/video/${videoId}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.item;
  } catch (error) {
    console.error('Error fetching video:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { videoId } = await params;
  const video = await fetchVideoData(videoId);

  if (!video) {
    return {
      title: 'Video nenájdené | TrendWatch',
      description: 'Požadované video nebolo nájdené alebo bolo odstránené.',
      robots: 'noindex, nofollow',
    };
  }

  const formattedTitle = `${video.title} | TrendWatch`;
  const formattedDescription =
    video.description.length > 160
      ? `${video.description.substring(0, 157)}...`
      : video.description;

  return {
    title: formattedTitle,
    description: formattedDescription,
    keywords: [
      'YouTube video',
      video.channel.title,
      'TrendWatch',
      ...(video.tags || []),
    ],
    authors: [
      { name: 'TrendWatch' },
      {
        name: video.channel.title,
        url: `https://youtube.com/channel/${video.channel.id}`,
      },
    ],
    category: 'Entertainment',
    robots: 'index, follow',
    openGraph: {
      title: formattedTitle,
      description: formattedDescription,
      type: 'video.other', // Opravený typ
      locale: 'sk_SK',
      siteName: 'TrendWatch',
      images: [
        {
          url: video.thumbnails.maxres?.url || video.thumbnails.high.url,
          width: video.thumbnails.maxres?.width || 1280,
          height: video.thumbnails.maxres?.height || 720,
          alt: video.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: formattedTitle,
      description: formattedDescription,
      images: [video.thumbnails.high.url],
    },
    manifest: '/manifest.json',
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/watch/${video.id}`,
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    ),
    applicationName: 'TrendWatch',
    formatDetection: {
      telephone: false,
    },
    // Pridané strukturované dáta ako JSON-LD
    other: {
      'script:ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: video.title,
        description: formattedDescription,
        thumbnailUrl: [video.thumbnails.high.url],
        uploadDate: video.publishedAt,
        duration: video.contentDetails.duration,
        interactionStatistic: [
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/WatchAction',
            userInteractionCount: video.statistics.viewCount,
          },
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/LikeAction',
            userInteractionCount: video.statistics.likeCount,
          },
        ],
        author: {
          '@type': 'Person',
          name: video.channel.title,
        },
      }),
    },
  };
}

export default async function WatchPage({ params }: Props) {
  const { videoId } = await params;
  const video = await fetchVideoData(videoId);

  if (!video) {
    notFound();
  }

  return (
    <div className="bg-background flex w-full flex-col">
      {/* Video sekcia - full width čierny pruh */}
      <div className="w-full bg-black">
        <div className="mx-auto max-w-[2160px]">
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      </div>

      {/* Content sekcia - centrovaná s max width */}
      <div className="mx-auto w-full max-w-[1600px] px-6">
        <div className="flex gap-6 py-6">
          {/* Main content */}
          <div className="max-w-[1280px] min-w-0 flex-1">
            <VideoInfo
              title={video.title}
              channelTitle={video.channel.title}
              channelThumbnail={video.channel.thumbnail}
              viewCount={video.statistics.viewCount}
              publishedAt={video.publishedAt}
              description={video.description}
              likeCount={video.statistics.likeCount}
              channelId={video.channel.id}
            />
          </div>

          {/* Related videos sidebar */}
          <div className="hidden w-[400px] lg:block">
            <RelatedVideosSidebar
              videoId={video.id}
              currentChannelId={video.channel.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
