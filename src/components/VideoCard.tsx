import React from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface VideoCardProps {
  title: string;
  thumbnail: string;
  channelTitle: string;
  videoId: string;
}

const VideoCard: React.FC<VideoCardProps> = ({
  title,
  thumbnail,
  channelTitle,
  videoId,
}) => {
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
          <CardFooter className="px-0 py-0">
            <p className="text-muted-foreground text-sm">{channelTitle}</p>
          </CardFooter>
        </CardContent>
      </a>
    </Card>
  );
};

export default VideoCard;
