'use client';

import { useState, useEffect } from 'react';
import type { HistoryEntry, HistoryPeriod } from '@/types/history';
import HistoryVideoCard from '@/components/HistoryVideoCard';
import { groupHistoryByPeriod } from '@/utils/helpers';
import { Loader2 } from 'lucide-react';
import { getWatchHistory } from '@/libs/WatchHistory';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

type Props = {
  historyData: HistoryEntry[];
  hasMore: boolean;
  currentPage: number;
  pageSize: number;
};

export default function HistoryVideoList({
  historyData: initialData,
  hasMore: initialHasMore,
  currentPage,
  pageSize,
}: Props) {
  const [data, setData] = useState<HistoryEntry[]>(initialData);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(currentPage);
  const [loading, setLoading] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
  });

  useEffect(() => {
    const loadMore = async () => {
      if (!hasMore || loading) return;

      setLoading(true);
      try {
        const nextPage = page + 1;
        const result = await getWatchHistory(nextPage, pageSize);

        setData((prev) => [...prev, ...result.items]);
        setHasMore(result.hasMore);
        setPage(nextPage);
      } catch (error) {
        console.error('Chyba pri načítaní histórie:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isIntersecting) {
      loadMore();
    }
  }, [isIntersecting, hasMore, loading, page, pageSize]);

  const groupedHistory = groupHistoryByPeriod(data);

  return (
    <>
      {(Object.keys(groupedHistory) as HistoryPeriod[]).map((period) => {
        const videos = groupedHistory[period];
        if (videos.length === 0) return null;

        return (
          <div key={period} className="mb-8">
            <h2 className="text-muted-foreground mb-4 text-lg font-medium">
              {period}
            </h2>
            <div className="space-y-4">
              {videos.map((video) => (
                <HistoryVideoCard
                  key={`${video.videoId}-${video.watchedAt}`}
                  video={video}
                />
              ))}
            </div>
          </div>
        );
      })}

      {hasMore && (
        <div ref={ref} className="flex justify-center p-4">
          {loading && <Loader2 className="h-6 w-6 animate-spin" />}
        </div>
      )}
    </>
  );
}
