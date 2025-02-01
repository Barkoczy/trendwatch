import React from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import {
  MoreVertical,
  Clock,
  ListPlus,
  Share2,
  Ban,
  ThumbsDown,
  Flag,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';
import { formatViews, formatDuration } from '@/utils/helpers';

interface VideoCardProps {
  videoId: string;
  title: string;
  thumbnail: string;
  channel: {
    title: string;
    thumbnail: string;
  };
  statistics: {
    viewCount: string;
  };
  publishedAt: string;
  duration: string;
}

const VideoCard: React.FC<VideoCardProps> = ({
  videoId,
  title,
  thumbnail,
  channel,
  statistics,
  publishedAt,
  duration,
}) => {
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      locale: sk,
      addSuffix: false,
    });
  };

  return (
    <Card className="group bg-background border-0 shadow dark:bg-violet-950 dark:shadow-violet-900">
      <div className="space-y-2">
        <div className="relative overflow-hidden rounded-t-lg">
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            className="relative block w-full pt-[56.25%]"
          >
            <Image
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              src={thumbnail}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL={thumbnail}
            />
          </a>
          <div className="absolute right-2 bottom-2 rounded bg-black/80 px-1 text-xs text-white">
            {formatDuration(duration)}
          </div>
        </div>

        <div className="flex px-3 pb-3">
          <div className="relative mr-3 h-8 w-8 flex-shrink-0">
            <Image
              src={channel.thumbnail}
              alt={channel.title}
              fill
              className="rounded-full object-cover"
              sizes="32px"
              placeholder="blur"
              blurDataURL={channel.thumbnail}
            />
          </div>

          <div className="flex-grow">
            <h3 className="mb-2 line-clamp-2 text-sm font-semibold">{title}</h3>
            <div className="text-muted-foreground text-xs">
              <p className="pb-1">{channel.title}</p>
              <p>
                {formatViews(Number(statistics.viewCount))}
                &nbsp;views&nbsp;•&nbsp;
                {formatDate(publishedAt)}
              </p>
            </div>
          </div>

          <div className="ml-2 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer rounded-full border-0 p-1 outline-0 hover:bg-transparent">
                <MoreVertical className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="dark:border-primary w-56 border-white shadow-2xl"
              >
                <DropdownMenuItem>
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Pozrieť neskôr</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ListPlus className="mr-2 h-4 w-4" />
                  <span>Pridať do playlistu</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  <span>Zdieľať</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive dark:text-red-500">
                  <Ban className="mr-2 h-4 w-4" />
                  <span>Nemám záujem</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive dark:text-red-500">
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  <span>Neodporúčať kanál</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive dark:text-red-500">
                  <Flag className="mr-2 h-4 w-4" />
                  <span>Nahlásiť</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VideoCard;
