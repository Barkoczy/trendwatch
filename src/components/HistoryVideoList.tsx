'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { HistoryEntry, HistoryPeriod } from '@/types/history';
import HistoryVideoCard from '@/components/HistoryVideoCard';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { groupHistoryByPeriod } from '@/utils/helpers';

export default function HistoryVideoList({
  defaultPageSize = 20,
}: {
  defaultPageSize?: number;
}) {
  const [data, setData] = useState<HistoryEntry[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
  });

  // Initial data fetch on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingInitial(true);
        const response = await fetch(
          `/api/history?page=${page}&pageSize=${defaultPageSize}`
        );
        const result = await response.json();
        setData(result.items);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Chyba pri načítaní histórie:', error);
      } finally {
        setLoadingInitial(false);
      }
    };

    loadInitialData();
  }, [page, defaultPageSize]);

  // Load more data when near bottom
  useEffect(() => {
    const loadMore = async () => {
      if (!hasMore || loadingMore) return;

      setLoadingMore(true);
      try {
        const nextPage = page + 1;
        const response = await fetch(
          `/api/history?page=${nextPage}&pageSize=${defaultPageSize}`
        );
        const result = await response.json();

        setData((prev) => [...prev, ...result.items]);
        setHasMore(result.hasMore);
        setPage(nextPage);
      } catch (error) {
        console.error('Chyba pri načítaní histórie:', error);
      } finally {
        setLoadingMore(false);
      }
    };

    if (isIntersecting) {
      loadMore();
    }
  }, [isIntersecting, hasMore, loadingMore, page, defaultPageSize]);

  // Group history data for display
  const groupedHistory = groupHistoryByPeriod(data);

  return (
    <>
      {/* Initial loading state */}
      {loadingInitial ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          {/* Display history data */}
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

          {/* Loading more indicator */}
          {hasMore && (
            <div ref={ref} className="flex justify-center p-4">
              {loadingMore && <Loader2 className="h-6 w-6 animate-spin" />}
            </div>
          )}
        </>
      )}
    </>
  );
}
