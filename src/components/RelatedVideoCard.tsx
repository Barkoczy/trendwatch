'use client';

import Image from 'next/image';
import Link from 'next/link';
import VideoCardMenu from '@/components/VideoCardMenu';
import { formatViews, formatDuration, formatDate } from '@/utils/helpers';

interface RelatedVideoCardProps {
  videoId: string;
  title: string;
  thumbnail: string;
  channel: {
    title: string;
    thumbnail: string;
  };
  statistics: {
    viewCount: number;
  };
  publishedAt: string;
  duration: string;
}

export default function RelatedVideoCard({
  videoId,
  title,
  thumbnail,
  channel,
  statistics,
  publishedAt,
  duration,
}: RelatedVideoCardProps) {
  return (
    <Link
      href={`/watch/${videoId}`}
      className="group flex w-full cursor-pointer gap-2"
    >
      {/* Thumbnail Container */}
      <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-lg">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover"
          sizes="160px"
          placeholder="blur"
          blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
            '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="96"><rect width="100%" height="100%" fill="#1f2937"/></svg>'
          ).toString('base64')}`}
        />
        <div className="absolute right-1 bottom-1 rounded bg-black/80 px-1 py-0.5 text-xs text-white">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Content Container */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <h3 className="mb-1 line-clamp-2 text-sm font-medium text-gray-100">
            {title}
          </h3>
          <VideoCardMenu />
        </div>

        <div className="flex flex-col text-xs text-gray-400">
          <span>{channel.title}</span>
          <div className="flex items-center">
            <span>{formatViews(statistics.viewCount)}</span>
            <span className="mx-1">•</span>
            <span>{formatDate(publishedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
