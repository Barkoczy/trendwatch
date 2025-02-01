'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils/helpers';
import type { HistoryEntry } from '@/types/history';

type HistoryCardProps = {
  video: HistoryEntry;
};

export default function HistoryVideoCard({ video }: HistoryCardProps) {
  const router = useRouter();

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/watch/${video.videoId}`);
  };

  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/channel/${video.channelId}`);
  };

  return (
    <div
      onClick={handleVideoClick}
      className="group hover:bg-accent relative flex cursor-pointer gap-4 rounded-lg p-2"
    >
      <div
        className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-md"
        onClick={handleVideoClick}
      >
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          className="object-cover"
          sizes="160px"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div
            onClick={handleVideoClick}
            className="hover:text-primary line-clamp-2 cursor-pointer text-base font-medium"
          >
            {video.title}
          </div>
          <div
            onClick={handleChannelClick}
            className="text-muted-foreground hover:text-primary mt-1 cursor-pointer text-sm"
          >
            {video.channelTitle}
          </div>
        </div>
        <div className="text-muted-foreground text-xs">
          Pozreté {formatDate(video.watchedAt)}
        </div>
      </div>
    </div>
  );
}
