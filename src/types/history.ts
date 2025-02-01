export interface HistoryEntry {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  watchedAt: string;
}

export type HistoryPeriod = 'Dnes' | 'Včera' | 'Tento týždeň' | 'Staršie';
export type GroupedHistory = Record<HistoryPeriod, HistoryEntry[]>;
