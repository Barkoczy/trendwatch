import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';
import { formatViews } from '@/utils/helpers';

interface VideoCardProps {
  title: string;
  thumbnail: string;
  channelTitle: string;
  channelThumbnail: string;
  viewCount: string;
  publishedAt: string;
  videoId: string;
}

const VideoCard: React.FC<VideoCardProps> = ({
  title,
  thumbnail,
  channelTitle,
  channelThumbnail,
  viewCount,
  publishedAt,
  videoId,
}) => {
  // Formátovanie dátumu pomocou date-fns
  const formatDate = (dateString: string) => {
    return `pred ${formatDistanceToNow(new Date(dateString), {
      locale: sk,
      addSuffix: false,
    })}`;
  };

  return (
    <Card className="group bg-background overflow-hidden border-0 shadow-2xl">
      <a
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <CardHeader className="p-0">
          <div className="relative w-full overflow-hidden pt-[56.25%]">
            <Image
              className="absolute inset-0 h-full w-full transform object-cover transition-all duration-300 will-change-transform group-hover:scale-105"
              fill={true}
              src={thumbnail}
              alt={title}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="bg-background/20 absolute top-2 right-2 rounded-full p-2 opacity-0 backdrop-blur transition-all group-hover:opacity-100">
              <ExternalLink className="text-background h-4 w-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-4">
          <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-lg font-semibold transition-colors">
            {title}
          </h3>
          <div className="flex items-center space-x-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image
                src={channelThumbnail}
                alt={channelTitle}
                fill={true}
                className="object-cover"
                sizes="32px"
              />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">
                {formatViews(Number(viewCount))}&nbsp;•&nbsp;
                {formatDate(publishedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </a>
    </Card>
  );
};

export default VideoCard;
