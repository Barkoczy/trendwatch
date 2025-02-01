'use client';

import RelatedVideoCard from '@/components/RelatedVideoCard';
import { useRelatedVideos } from '@/hooks/useRelatedVideos';
import { Skeleton } from '@/components/ui/skeleton';

export default function RelatedVideosSidebar({
  videoId,
  currentChannelId,
}: {
  videoId: string;
  currentChannelId: string;
}) {
  const { videos, isLoading, error } = useRelatedVideos(videoId, {
    currentChannelId,
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-100">
          Odporúčané videá
        </h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-24 w-40 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 p-4 text-red-500">
        Chyba pri načítaní odporúčaných videí
      </div>
    );
  }

  if (!videos.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-100">Odporúčané videá</h2>
      <div className="space-y-4">
        {videos.map((video) => (
          <RelatedVideoCard
            key={video.id}
            videoId={video.id}
            title={video.title}
            thumbnail={video.thumbnails.high.url}
            channel={{
              title: video.channel.title,
              thumbnail: video.channel.thumbnail,
            }}
            statistics={{
              viewCount: parseInt(video.statistics.viewCount, 10),
            }}
            publishedAt={video.publishedAt}
            duration={video.contentDetails.duration}
          />
        ))}
      </div>
    </div>
  );
}
