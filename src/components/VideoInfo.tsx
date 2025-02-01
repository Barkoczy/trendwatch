import React from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';
import { formatViews } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface VideoInfoProps {
  title: string;
  channelTitle: string;
  channelThumbnail: string;
  viewCount: string;
  publishedAt: string;
  description: string;
  likeCount: string;
  channelId: string;
}

const VideoInfo: React.FC<VideoInfoProps> = ({
  title,
  channelTitle,
  channelThumbnail,
  viewCount,
  publishedAt,
  description,
  likeCount,
  channelId,
}) => {
  const formatDate = (date: string) =>
    formatDistanceToNow(new Date(date), { locale: sk, addSuffix: true });

  return (
    <div className="flex w-full flex-col">
      {/* Title */}
      <h1 className="mb-4 text-xl leading-normal font-medium">{title}</h1>

      {/* Channel and actions row */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        {/* Channel info */}
        <div className="flex items-center gap-3">
          <Link href={`/channel/${channelId}`}>
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              <Image
                src={channelThumbnail}
                alt={channelTitle}
                fill
                className="object-cover"
              />
            </div>
          </Link>
          <div className="flex flex-col">
            <Link
              href={`/channel/${channelId}`}
              className="font-medium hover:text-violet-500 dark:hover:text-violet-400"
            >
              {channelTitle}
            </Link>
            <span className="text-muted-foreground text-sm">
              {formatViews(parseInt(viewCount))} zhliadnutí •{' '}
              {formatDate(publishedAt)}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <div className="bg-secondary flex rounded-full">
            <Button
              size="sm"
              variant="secondary"
              className="rounded-l-full px-4"
            >
              <ThumbsUp className="mr-2 h-5 w-5" />
              <span>{formatViews(parseInt(likeCount))}</span>
            </Button>
            <div className="bg-border w-px" />
            <Button
              size="sm"
              variant="secondary"
              className="rounded-r-full px-4"
            >
              <ThumbsDown className="h-5 w-5" />
            </Button>
          </div>

          <Button size="sm" variant="secondary" className="rounded-full px-4">
            <Share2 className="mr-2 h-5 w-5" />
            <span>Zdieľať</span>
          </Button>

          <Button size="sm" variant="ghost" className="rounded-full px-3">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="bg-secondary/50 hover:bg-secondary cursor-pointer rounded-xl p-3 transition-colors">
        <p className="text-sm whitespace-pre-wrap">{description}</p>
      </div>
    </div>
  );
};

export default VideoInfo;
