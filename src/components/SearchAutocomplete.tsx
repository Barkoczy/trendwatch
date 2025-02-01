import React, { useState, useEffect } from 'react';
import { Search, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useVideos } from '@/hooks/useVideos';
import type { UserSettings } from '@/types/settings';
import type { Video } from '@/types/video';

interface SearchAutocompleteProps {
  onSearch: (query: string) => void;
  localSearchQuery: string;
  setLocalSearchQuery: (query: string) => void;
  settings: UserSettings;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  onSearch,
  localSearchQuery,
  setLocalSearchQuery,
  settings,
}) => {
  const [showResults, setShowResults] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Používame existujúce settings
  const { videos, isLoading } = useVideos(settings);

  // Reset showResults pri zmene cesty
  useEffect(() => {
    setShowResults(false);
  }, [pathname]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    onSearch(value);

    if (!isHomePage && value.length >= 3) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleInputFocus = () => {
    if (!isHomePage && localSearchQuery.length >= 3) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const getBestThumbnail = (video: Video) => {
    const { thumbnails } = video;
    return (
      thumbnails.maxres?.url ||
      thumbnails.standard?.url ||
      thumbnails.high.url ||
      thumbnails.medium.url ||
      thumbnails.default.url
    );
  };

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Vyhľadať videá..."
          value={localSearchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-full pl-10"
        />
        {isLoading && localSearchQuery.length >= 3 && !isHomePage && (
          <Loader className="dark:text-primary absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
        )}
      </div>

      {showResults && !isHomePage && localSearchQuery.length >= 3 && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-md border bg-white shadow-lg dark:border-violet-700 dark:bg-violet-800">
          {videos.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-violet-200">
              {isLoading ? 'Vyhľadávam...' : 'Žiadne výsledky'}
            </div>
          ) : (
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {videos.slice(0, 5).map((video) => (
                <Link
                  key={video.id}
                  href={`/watch/${video.id}`}
                  className="flex items-start gap-3 border-b border-gray-200 p-3 hover:bg-gray-50 dark:border-violet-700 dark:hover:bg-violet-700"
                >
                  <div className="relative h-20 w-36 flex-shrink-0">
                    <Image
                      src={getBestThumbnail(video)}
                      alt={video.title}
                      fill
                      sizes="(max-width: 768px) 144px, 144px"
                      className="rounded object-cover"
                      priority={videos.indexOf(video) < 3}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-medium">
                      {video.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-violet-400">
                      <span>{video.channel.title}</span>
                      <span>•</span>
                      <span>
                        {parseInt(video.statistics.viewCount).toLocaleString()}{' '}
                        zhliadnutí
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
