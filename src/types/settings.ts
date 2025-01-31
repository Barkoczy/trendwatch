export interface UserSettings {
  regionCode: string;
  maxResults: number;
  includeShorts: boolean;
  order:
    | 'mostPopular'
    | 'date'
    | 'rating'
    | 'relevance'
    | 'title'
    | 'videoCount'
    | 'viewCount';
  publishedAfter?: string;
  publishedBefore?: string;
  safeSearch?: 'moderate' | 'none' | 'strict';
  videoCategoryId?: string;
  searchQuery?: string;
}
